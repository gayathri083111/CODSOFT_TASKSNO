import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService, generateToken, verifyToken } from './src/server/db.ts';
import { Role } from './src/types.ts';

interface AuthRequest extends Request {
  user?: any;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (user) {
    req.user = user;
  }
  next();
}

function requireRole(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to ${allowedRoles.join(', ')}.` });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(authMiddleware);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'EduManage API', timestamp: new Date().toISOString() });
  });

  // 1. AUTHENTICATION ROUTES
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username or email and password are required.' });
      }

      const user = await dbService.verifyCredentials(username, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username/email or password.' });
      }

      // Role check if specific portal login requested
      if (role && user.role !== role) {
        return res.status(403).json({
          error: `Role mismatch: This account has '${user.role}' privileges. Please use the ${user.role} portal.`,
        });
      }

      const token = generateToken(user);
      return res.json({
        token,
        user,
        message: 'Login successful.',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error during authentication.' });
    }
  });

  app.get('/api/auth/me', (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    return res.json({ user: req.user });
  });

  app.get('/api/auth/demo-credentials', (req, res) => {
    res.json({
      admin: { username: 'admin', email: 'admin@edumanage.edu', password: 'admin123', role: 'ADMIN', name: 'Dr. Arthur Pendelton' },
      teacher: { username: 'teacher', email: 'teacher@edumanage.edu', password: 'teacher123', role: 'TEACHER', name: 'Prof. Sarah Jenkins' },
      student: { username: 'student', email: 'student@edumanage.edu', password: 'student123', role: 'STUDENT', name: 'Alex Rivera' },
    });
  });

  // 2. DASHBOARD STATS
  app.get('/api/stats/admin', requireRole(['ADMIN']), async (req, res) => {
    try {
      const stats = await dbService.getAdminStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch admin stats.' });
    }
  });

  app.get('/api/stats/teacher', requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
      const stats = await dbService.getTeacherStats(req.user?.teacherId || req.user?.id);
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch teacher stats.' });
    }
  });

  app.get('/api/stats/student', requireRole(['STUDENT', 'ADMIN', 'TEACHER']), async (req: AuthRequest, res) => {
    try {
      const studentId = (req.query.studentId as string) || req.user?.studentId || 'stu-1';
      // If student role, ensure student can only query own stats
      if (req.user?.role === 'STUDENT' && req.user.studentId && req.user.studentId !== studentId && studentId !== 'stu-1') {
        return res.status(403).json({ error: 'Forbidden: You can only access your own records.' });
      }
      const stats = await dbService.getStudentStats(studentId);
      if (!stats) return res.status(404).json({ error: 'Student record not found.' });
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch student stats.' });
    }
  });

  // 3. STUDENTS CRUD
  app.get('/api/students', async (req: AuthRequest, res) => {
    try {
      // If student role, restrict to own profile unless admin/teacher
      if (req.user?.role === 'STUDENT') {
        const student = await dbService.getStudentById(req.user.studentId || req.user.id);
        return res.json(student ? [student] : []);
      }

      const { search, departmentId, courseId, year, status } = req.query;
      const students = await dbService.getStudents({
        search: search as string,
        departmentId: departmentId as string,
        courseId: courseId as string,
        year: year ? Number(year) : undefined,
        status: status as any,
      });
      res.json(students);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch students.' });
    }
  });

  app.get('/api/students/:id', async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      // If student role, check authorization
      if (req.user?.role === 'STUDENT') {
        if (req.user.studentId !== id && req.user.id !== id && id !== 'stu-1') {
          return res.status(403).json({ error: 'Forbidden: You can only view your own student record.' });
        }
      }
      const student = await dbService.getStudentById(id);
      if (!student) return res.status(404).json({ error: 'Student not found.' });
      res.json(student);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch student details.' });
    }
  });

  app.post('/api/students', requireRole(['ADMIN']), async (req, res) => {
    try {
      const { name, email, phone, departmentId, courseId, year, section, dateOfBirth, address, guardianName, guardianPhone, bloodGroup, status, password } = req.body;
      if (!name || !email || !departmentId || !courseId) {
        return res.status(400).json({ error: 'Name, email, department, and course are required.' });
      }
      const created = await dbService.createStudent({
        name,
        email,
        phone,
        departmentId,
        courseId,
        year: year ? Number(year) : 1,
        section: section || 'A',
        dateOfBirth,
        address,
        guardianName,
        guardianPhone,
        bloodGroup,
        status,
        password,
      });
      res.status(201).json(created);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to create student.' });
    }
  });

  app.put('/api/students/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await dbService.updateStudent(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Student not found.' });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to update student.' });
    }
  });

  app.delete('/api/students/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await dbService.deleteStudent(id);
      if (!deleted) return res.status(404).json({ error: 'Student not found.' });
      res.json({ message: 'Student and associated records removed successfully.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to delete student.' });
    }
  });

  // 4. TEACHERS CRUD
  app.get('/api/teachers', async (req, res) => {
    try {
      const { search, departmentId } = req.query;
      const teachers = await dbService.getTeachers({
        search: search as string,
        departmentId: departmentId as string,
      });
      res.json(teachers);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch teachers.' });
    }
  });

  app.get('/api/teachers/:id', async (req, res) => {
    try {
      const teacher = await dbService.getTeacherById(req.params.id);
      if (!teacher) return res.status(404).json({ error: 'Teacher not found.' });
      res.json(teacher);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch teacher.' });
    }
  });

  app.post('/api/teachers', requireRole(['ADMIN']), async (req, res) => {
    try {
      const { name, email, phone, departmentId, designation, specialization, password } = req.body;
      if (!name || !email || !departmentId || !designation) {
        return res.status(400).json({ error: 'Name, email, department, and designation are required.' });
      }
      const created = await dbService.createTeacher({
        name,
        email,
        phone,
        departmentId,
        designation,
        specialization,
        password,
      });
      res.status(201).json(created);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to create teacher.' });
    }
  });

  app.put('/api/teachers/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
      const updated = await dbService.updateTeacher(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Teacher not found.' });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to update teacher.' });
    }
  });

  app.delete('/api/teachers/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
      const deleted = await dbService.deleteTeacher(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Teacher not found.' });
      res.json({ message: 'Teacher removed successfully.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to delete teacher.' });
    }
  });

  // 5. LOOKUPS: DEPARTMENTS, COURSES, SUBJECTS
  app.get('/api/departments', async (req, res) => {
    res.json(await dbService.getDepartments());
  });

  app.get('/api/courses', async (req, res) => {
    res.json(await dbService.getCourses());
  });

  app.get('/api/subjects', async (req, res) => {
    res.json(await dbService.getSubjects());
  });

  // 6. ATTENDANCE
  app.get('/api/attendance', async (req: AuthRequest, res) => {
    try {
      const { studentId, subjectId, courseId, date, status } = req.query;

      // Role check: Student can only view own attendance
      let targetStudentId = studentId as string;
      if (req.user?.role === 'STUDENT') {
        targetStudentId = req.user.studentId || 'stu-1';
      }

      const list = await dbService.getAttendance({
        studentId: targetStudentId,
        subjectId: subjectId as string,
        courseId: courseId as string,
        date: date as string,
        status: status as any,
      });
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch attendance.' });
    }
  });

  app.post('/api/attendance/mark', requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'Records array is required.' });
      }
      const markedByName = req.user?.name || 'Faculty';
      const augmented = records.map((r) => ({ ...r, markedByName }));
      const saved = await dbService.recordAttendanceBatch(augmented);
      res.status(201).json({ count: saved.length, records: saved });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to record attendance.' });
    }
  });

  // 7. EXAMINATIONS & MARKS
  app.get('/api/examinations', async (req, res) => {
    res.json(await dbService.getExaminations());
  });

  app.post('/api/examinations', requireRole(['ADMIN']), async (req, res) => {
    try {
      const { code, name, type, semester, startDate, endDate, totalMarks, passingMarks } = req.body;
      if (!code || !name || !startDate || !endDate) {
        return res.status(400).json({ error: 'Code, name, start date, and end date are required.' });
      }
      const created = await dbService.createExamination({
        code,
        name,
        type: type || 'MID_TERM',
        semester: Number(semester) || 1,
        startDate,
        endDate,
        totalMarks: Number(totalMarks) || 100,
        passingMarks: Number(passingMarks) || 40,
      });
      res.status(201).json(created);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to create examination.' });
    }
  });

  app.get('/api/marks', async (req: AuthRequest, res) => {
    try {
      const { examinationId, subjectId, studentId } = req.query;

      let targetStudentId = studentId as string;
      if (req.user?.role === 'STUDENT') {
        targetStudentId = req.user.studentId || 'stu-1';
      }

      const list = await dbService.getMarks({
        examinationId: examinationId as string,
        subjectId: subjectId as string,
        studentId: targetStudentId,
      });
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch marks.' });
    }
  });

  app.post('/api/marks/batch', requireRole(['TEACHER', 'ADMIN']), async (req, res) => {
    try {
      const { entries } = req.body;
      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: 'Entries array is required.' });
      }
      const saved = await dbService.saveBatchMarks(entries);
      res.status(201).json({ count: saved.length, marks: saved });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to save marks.' });
    }
  });

  // 8. FEES
  app.get('/api/fees', async (req: AuthRequest, res) => {
    try {
      const { studentId, status } = req.query;

      let targetStudentId = studentId as string;
      if (req.user?.role === 'STUDENT') {
        targetStudentId = req.user.studentId || 'stu-1';
      }

      const list = await dbService.getFees({
        studentId: targetStudentId,
        status: status as any,
      });
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch fees.' });
    }
  });

  app.post('/api/fees', requireRole(['ADMIN']), async (req, res) => {
    try {
      const { studentId, feeType, amount, dueDate } = req.body;
      if (!studentId || !feeType || !amount || !dueDate) {
        return res.status(400).json({ error: 'Student ID, fee type, amount, and due date are required.' });
      }
      const fee = await dbService.createFee({
        studentId,
        feeType,
        amount: Number(amount),
        dueDate,
      });
      if (!fee) return res.status(404).json({ error: 'Student not found.' });
      res.status(201).json(fee);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to create fee record.' });
    }
  });

  app.put('/api/fees/:id/pay', requireRole(['ADMIN']), async (req, res) => {
    try {
      const { amount, paymentMode, receiptNo } = req.body;
      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Valid payment amount is required.' });
      }
      const updated = await dbService.recordPayment(req.params.id, {
        amount: Number(amount),
        paymentMode: paymentMode || 'Cash',
        receiptNo,
      });
      if (!updated) return res.status(404).json({ error: 'Fee record not found.' });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to record fee payment.' });
    }
  });

  // 9. ACADEMIC RECORDS
  app.get('/api/academic-records', async (req: AuthRequest, res) => {
    try {
      const { studentId } = req.query;

      let targetStudentId = studentId as string;
      if (req.user?.role === 'STUDENT') {
        targetStudentId = req.user.studentId || 'stu-1';
      }

      const list = await dbService.getAcademicRecords({ studentId: targetStudentId });
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch academic records.' });
    }
  });

  app.put('/api/academic-records/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
      const updated = await dbService.updateAcademicRecord(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Academic record not found.' });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to update academic record.' });
    }
  });

  // 10. VITE MIDDLEWARE (DEV) / STATIC SERVE (PROD)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduManage Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EduManage server:', err);
  process.exit(1);
});
