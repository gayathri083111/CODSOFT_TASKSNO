import crypto from 'crypto';
import {
  User,
  Student,
  Teacher,
  Department,
  Course,
  Subject,
  AttendanceRecord,
  Examination,
  MarkRecord,
  FeeRecord,
  AcademicRecord,
  Role,
  StudentStatus,
  AttendanceStatus,
  FeeStatus,
  ExamType
} from '../types.ts';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    name: user.name,
    studentId: user.studentId,
    teacherId: user.teacherId,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token: string): User | null {
  try {
    const json = Buffer.from(token, 'base64').toString('utf-8');
    const data = JSON.parse(json);
    if (!data.exp || data.exp < Date.now()) {
      return null;
    }
    return {
      id: data.id,
      username: data.username,
      role: data.role,
      email: data.email,
      name: data.name,
      studentId: data.studentId,
      teacherId: data.teacherId,
      createdAt: new Date().toISOString(),
    };
  } catch (e) {
    return null;
  }
}

// In-Memory Database Store with initial seed
interface DatabaseState {
  users: (User & { passwordHash: string })[];
  departments: Department[];
  courses: Course[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  attendances: AttendanceRecord[];
  examinations: Examination[];
  marks: MarkRecord[];
  fees: FeeRecord[];
  academicRecords: AcademicRecord[];
}

const depts: Department[] = [
  { id: 'dept-1', code: 'CSE', name: 'Computer Science and Engineering' },
  { id: 'dept-2', code: 'IT', name: 'Information Technology' },
  { id: 'dept-3', code: 'ECE', name: 'Electronics and Communication' },
  { id: 'dept-4', code: 'MECH', name: 'Mechanical Engineering' },
];

const courses: Course[] = [
  { id: 'crs-1', code: 'BTECH-CS', name: 'B.Tech Computer Science & Eng.', departmentId: 'dept-1', departmentName: 'Computer Science and Engineering', durationYrs: 4 },
  { id: 'crs-2', code: 'BTECH-IT', name: 'B.Tech Information Technology', departmentId: 'dept-2', departmentName: 'Information Technology', durationYrs: 4 },
  { id: 'crs-3', code: 'BTECH-ECE', name: 'B.Tech Electronics & Comm.', departmentId: 'dept-3', departmentName: 'Electronics and Communication', durationYrs: 4 },
  { id: 'crs-4', code: 'BTECH-ME', name: 'B.Tech Mechanical Engineering', departmentId: 'dept-4', departmentName: 'Mechanical Engineering', durationYrs: 4 },
];

const teachers: Teacher[] = [
  {
    id: 'tch-1',
    teacherId: 'TCH-2026-001',
    userId: 'usr-teacher-1',
    name: 'Prof. Sarah Jenkins',
    email: 'teacher@edumanage.edu',
    phone: '+1 (555) 234-5678',
    departmentId: 'dept-1',
    departmentName: 'Computer Science and Engineering',
    designation: 'Professor & HOD',
    specialization: 'Artificial Intelligence & Distributed Systems',
    joiningDate: '2021-08-15',
    subjectsCount: 2,
  },
  {
    id: 'tch-2',
    teacherId: 'TCH-2026-002',
    userId: 'usr-teacher-2',
    name: 'Dr. Robert Martinez',
    email: 'robert.m@edumanage.edu',
    phone: '+1 (555) 345-6789',
    departmentId: 'dept-1',
    departmentName: 'Computer Science and Engineering',
    designation: 'Associate Professor',
    specialization: 'Database Systems & Cloud Computing',
    joiningDate: '2022-01-10',
    subjectsCount: 2,
  },
  {
    id: 'tch-3',
    teacherId: 'TCH-2026-003',
    userId: 'usr-teacher-3',
    name: 'Prof. Elena Rostova',
    email: 'elena.r@edumanage.edu',
    phone: '+1 (555) 456-7890',
    departmentId: 'dept-3',
    departmentName: 'Electronics and Communication',
    designation: 'Assistant Professor',
    specialization: 'Embedded Systems & IoT',
    joiningDate: '2023-06-01',
    subjectsCount: 1,
  },
];

const subjects: Subject[] = [
  { id: 'sub-1', code: 'CS-301', name: 'Database Management Systems', credits: 4, semester: 5, courseId: 'crs-1', courseName: 'B.Tech Computer Science & Eng.', teacherId: 'tch-1', teacherName: 'Prof. Sarah Jenkins' },
  { id: 'sub-2', code: 'CS-302', name: 'Design and Analysis of Algorithms', credits: 4, semester: 5, courseId: 'crs-1', courseName: 'B.Tech Computer Science & Eng.', teacherId: 'tch-1', teacherName: 'Prof. Sarah Jenkins' },
  { id: 'sub-3', code: 'CS-303', name: 'Computer Networks & Security', credits: 3, semester: 5, courseId: 'crs-1', courseName: 'B.Tech Computer Science & Eng.', teacherId: 'tch-2', teacherName: 'Dr. Robert Martinez' },
  { id: 'sub-4', code: 'CS-304', name: 'Operating Systems Principles', credits: 4, semester: 5, courseId: 'crs-1', courseName: 'B.Tech Computer Science & Eng.', teacherId: 'tch-2', teacherName: 'Dr. Robert Martinez' },
  { id: 'sub-5', code: 'EC-201', name: 'Digital Logic and Microprocessors', credits: 3, semester: 3, courseId: 'crs-3', courseName: 'B.Tech Electronics & Comm.', teacherId: 'tch-3', teacherName: 'Prof. Elena Rostova' },
];

const students: Student[] = [
  {
    id: 'stu-1',
    studentId: 'STU-2026-001',
    userId: 'usr-student-1',
    name: 'Alex Rivera',
    email: 'student@edumanage.edu',
    phone: '+1 (555) 890-1234',
    departmentId: 'dept-1',
    departmentName: 'Computer Science and Engineering',
    courseId: 'crs-1',
    courseName: 'B.Tech Computer Science & Eng.',
    year: 3,
    section: 'A',
    dateOfBirth: '2004-05-14',
    address: '742 Evergreen Terrace, Springfield',
    guardianName: 'Carlos Rivera',
    guardianPhone: '+1 (555) 890-5678',
    bloodGroup: 'O+',
    status: 'ACTIVE',
    createdAt: '2024-08-01T00:00:00.000Z',
    attendanceRate: 92.5,
    gpa: 3.85,
    cgpa: 3.78,
    pendingFeeAmount: 0,
  },
  {
    id: 'stu-2',
    studentId: 'STU-2026-002',
    userId: 'usr-student-2',
    name: 'Sophia Chen',
    email: 'sophia.c@edumanage.edu',
    phone: '+1 (555) 901-2345',
    departmentId: 'dept-1',
    departmentName: 'Computer Science and Engineering',
    courseId: 'crs-1',
    courseName: 'B.Tech Computer Science & Eng.',
    year: 3,
    section: 'A',
    dateOfBirth: '2004-09-22',
    address: '108 Beacon St, Boston, MA',
    guardianName: 'Mei-Ling Chen',
    guardianPhone: '+1 (555) 901-6789',
    bloodGroup: 'A+',
    status: 'ACTIVE',
    createdAt: '2024-08-01T00:00:00.000Z',
    attendanceRate: 96.0,
    gpa: 3.92,
    cgpa: 3.90,
    pendingFeeAmount: 450,
  },
  {
    id: 'stu-3',
    studentId: 'STU-2026-003',
    userId: 'usr-student-3',
    name: 'Marcus Washington',
    email: 'marcus.w@edumanage.edu',
    phone: '+1 (555) 123-4567',
    departmentId: 'dept-1',
    departmentName: 'Computer Science and Engineering',
    courseId: 'crs-1',
    courseName: 'B.Tech Computer Science & Eng.',
    year: 3,
    section: 'B',
    dateOfBirth: '2003-11-03',
    address: '45 Lakeview Dr, Chicago, IL',
    guardianName: 'Derrick Washington',
    guardianPhone: '+1 (555) 123-8901',
    bloodGroup: 'B+',
    status: 'ACTIVE',
    createdAt: '2024-08-01T00:00:00.000Z',
    attendanceRate: 78.4,
    gpa: 3.25,
    cgpa: 3.30,
    pendingFeeAmount: 1200,
  },
  {
    id: 'stu-4',
    studentId: 'STU-2026-004',
    userId: 'usr-student-4',
    name: 'Emily Watson',
    email: 'emily.w@edumanage.edu',
    phone: '+1 (555) 678-9012',
    departmentId: 'dept-3',
    departmentName: 'Electronics and Communication',
    courseId: 'crs-3',
    courseName: 'B.Tech Electronics & Comm.',
    year: 2,
    section: 'A',
    dateOfBirth: '2005-02-18',
    address: '32 Pinecrest Ave, Seattle, WA',
    guardianName: 'George Watson',
    guardianPhone: '+1 (555) 678-3456',
    bloodGroup: 'AB+',
    status: 'ACTIVE',
    createdAt: '2025-08-01T00:00:00.000Z',
    attendanceRate: 88.9,
    gpa: 3.65,
    cgpa: 3.60,
    pendingFeeAmount: 0,
  },
  {
    id: 'stu-5',
    studentId: 'STU-2026-005',
    userId: 'usr-student-5',
    name: 'Devon Patel',
    email: 'devon.p@edumanage.edu',
    phone: '+1 (555) 345-6780',
    departmentId: 'dept-2',
    departmentName: 'Information Technology',
    courseId: 'crs-2',
    courseName: 'B.Tech Information Technology',
    year: 1,
    section: 'A',
    dateOfBirth: '2006-07-30',
    address: '88 Oak Ridge Way, Austin, TX',
    guardianName: 'Rajesh Patel',
    guardianPhone: '+1 (555) 345-9999',
    bloodGroup: 'O-',
    status: 'ACTIVE',
    createdAt: '2026-08-01T00:00:00.000Z',
    attendanceRate: 94.2,
    gpa: 3.70,
    cgpa: 3.70,
    pendingFeeAmount: 2500,
  },
];

const users: (User & { passwordHash: string })[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    email: 'admin@edumanage.edu',
    name: 'Dr. Arthur Pendelton',
    role: 'ADMIN',
    phone: '+1 (555) 100-2000',
    createdAt: '2024-01-01T00:00:00.000Z',
    passwordHash: hashPassword('admin123'),
  },
  {
    id: 'usr-teacher-1',
    username: 'teacher',
    email: 'teacher@edumanage.edu',
    name: 'Prof. Sarah Jenkins',
    role: 'TEACHER',
    phone: '+1 (555) 234-5678',
    teacherId: 'TCH-2026-001',
    createdAt: '2024-01-01T00:00:00.000Z',
    passwordHash: hashPassword('teacher123'),
  },
  {
    id: 'usr-student-1',
    username: 'student',
    email: 'student@edumanage.edu',
    name: 'Alex Rivera',
    role: 'STUDENT',
    phone: '+1 (555) 890-1234',
    studentId: 'STU-2026-001',
    createdAt: '2024-01-01T00:00:00.000Z',
    passwordHash: hashPassword('student123'),
  },
];

const examinations: Examination[] = [
  {
    id: 'exam-1',
    code: 'EXAM-2026-MID1',
    name: 'Mid-Term Examinations Fall 2026',
    type: 'MID_TERM',
    semester: 5,
    startDate: '2026-10-15',
    endDate: '2026-10-25',
    totalMarks: 100,
    passingMarks: 40,
  },
  {
    id: 'exam-2',
    code: 'EXAM-2026-FINAL',
    name: 'End-Semester Finals Spring 2026',
    type: 'FINAL_SEMESTER',
    semester: 4,
    startDate: '2026-05-10',
    endDate: '2026-05-24',
    totalMarks: 100,
    passingMarks: 40,
  },
];

const marks: MarkRecord[] = [
  {
    id: 'mrk-1',
    studentId: 'stu-1',
    studentCode: 'STU-2026-001',
    studentName: 'Alex Rivera',
    examinationId: 'exam-2',
    examinationName: 'End-Semester Finals Spring 2026',
    subjectId: 'sub-1',
    subjectCode: 'CS-301',
    subjectName: 'Database Management Systems',
    marksObtained: 91,
    totalMarks: 100,
    grade: 'A+',
    remarks: 'Outstanding conceptual mastery & SQL design.',
    updatedAt: '2026-05-28T14:30:00.000Z',
  },
  {
    id: 'mrk-2',
    studentId: 'stu-1',
    studentCode: 'STU-2026-001',
    studentName: 'Alex Rivera',
    examinationId: 'exam-2',
    examinationName: 'End-Semester Finals Spring 2026',
    subjectId: 'sub-2',
    subjectCode: 'CS-302',
    subjectName: 'Design and Analysis of Algorithms',
    marksObtained: 86,
    totalMarks: 100,
    grade: 'A',
    remarks: 'Excellent dynamic programming & complexity proofs.',
    updatedAt: '2026-05-28T15:00:00.000Z',
  },
  {
    id: 'mrk-3',
    studentId: 'stu-1',
    studentCode: 'STU-2026-001',
    studentName: 'Alex Rivera',
    examinationId: 'exam-2',
    examinationName: 'End-Semester Finals Spring 2026',
    subjectId: 'sub-3',
    subjectCode: 'CS-303',
    subjectName: 'Computer Networks & Security',
    marksObtained: 88,
    totalMarks: 100,
    grade: 'A',
    remarks: 'Strong understanding of TCP/IP protocol stack.',
    updatedAt: '2026-05-29T10:15:00.000Z',
  },
  {
    id: 'mrk-4',
    studentId: 'stu-2',
    studentCode: 'STU-2026-002',
    studentName: 'Sophia Chen',
    examinationId: 'exam-2',
    examinationName: 'End-Semester Finals Spring 2026',
    subjectId: 'sub-1',
    subjectCode: 'CS-301',
    subjectName: 'Database Management Systems',
    marksObtained: 95,
    totalMarks: 100,
    grade: 'A+',
    remarks: 'Flawless query optimization and indexing plan.',
    updatedAt: '2026-05-28T14:35:00.000Z',
  },
  {
    id: 'mrk-5',
    studentId: 'stu-3',
    studentCode: 'STU-2026-003',
    studentName: 'Marcus Washington',
    examinationId: 'exam-2',
    examinationName: 'End-Semester Finals Spring 2026',
    subjectId: 'sub-1',
    subjectCode: 'CS-301',
    subjectName: 'Database Management Systems',
    marksObtained: 74,
    totalMarks: 100,
    grade: 'B',
    remarks: 'Solid grasp of fundamentals; practice normalization.',
    updatedAt: '2026-05-28T14:40:00.000Z',
  },
];

const attendances: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'stu-1', studentCode: 'STU-2026-001', studentName: 'Alex Rivera', subjectId: 'sub-1', subjectName: 'Database Management Systems', subjectCode: 'CS-301', courseId: 'crs-1', date: '2026-09-10', status: 'PRESENT', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-2', studentId: 'stu-2', studentCode: 'STU-2026-002', studentName: 'Sophia Chen', subjectId: 'sub-1', subjectName: 'Database Management Systems', subjectCode: 'CS-301', courseId: 'crs-1', date: '2026-09-10', status: 'PRESENT', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-3', studentId: 'stu-3', studentCode: 'STU-2026-003', studentName: 'Marcus Washington', subjectId: 'sub-1', subjectName: 'Database Management Systems', subjectCode: 'CS-301', courseId: 'crs-1', date: '2026-09-10', status: 'LATE', remarks: 'Traffic delay 10 mins', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-4', studentId: 'stu-1', studentCode: 'STU-2026-001', studentName: 'Alex Rivera', subjectId: 'sub-1', subjectName: 'Database Management Systems', subjectCode: 'CS-301', courseId: 'crs-1', date: '2026-09-12', status: 'PRESENT', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-5', studentId: 'stu-2', studentCode: 'STU-2026-002', studentName: 'Sophia Chen', subjectId: 'sub-1', subjectName: 'Database Management Systems', subjectCode: 'CS-301', courseId: 'crs-1', date: '2026-09-12', status: 'PRESENT', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-6', studentId: 'stu-3', studentCode: 'STU-2026-003', studentName: 'Marcus Washington', subjectId: 'sub-1', subjectName: 'Database Management Systems', subjectCode: 'CS-301', courseId: 'crs-1', date: '2026-09-12', status: 'ABSENT', remarks: 'Unexcused', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-7', studentId: 'stu-1', studentCode: 'STU-2026-001', studentName: 'Alex Rivera', subjectId: 'sub-2', subjectName: 'Design and Analysis of Algorithms', subjectCode: 'CS-302', courseId: 'crs-1', date: '2026-09-14', status: 'PRESENT', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-8', studentId: 'stu-2', studentCode: 'STU-2026-002', studentName: 'Sophia Chen', subjectId: 'sub-2', subjectName: 'Design and Analysis of Algorithms', subjectCode: 'CS-302', courseId: 'crs-1', date: '2026-09-14', status: 'PRESENT', markedByName: 'Prof. Sarah Jenkins' },
  { id: 'att-9', studentId: 'stu-1', studentCode: 'STU-2026-001', studentName: 'Alex Rivera', subjectId: 'sub-3', subjectName: 'Computer Networks & Security', subjectCode: 'CS-303', courseId: 'crs-1', date: '2026-09-15', status: 'PRESENT', markedByName: 'Dr. Robert Martinez' },
];

const fees: FeeRecord[] = [
  { id: 'fee-1', studentId: 'stu-1', studentCode: 'STU-2026-001', studentName: 'Alex Rivera', feeType: 'Tuition Fee - Semester V', amount: 3800, paidAmount: 3800, dueDate: '2026-09-30', paidDate: '2026-09-05', status: 'PAID', receiptNo: 'REC-2026-4401', paymentMode: 'Online Transfer' },
  { id: 'fee-2', studentId: 'stu-1', studentCode: 'STU-2026-001', studentName: 'Alex Rivera', feeType: 'Laboratory & Computing Resources', amount: 450, paidAmount: 450, dueDate: '2026-09-30', paidDate: '2026-09-05', status: 'PAID', receiptNo: 'REC-2026-4402', paymentMode: 'Online Transfer' },
  { id: 'fee-3', studentId: 'stu-2', studentCode: 'STU-2026-002', studentName: 'Sophia Chen', feeType: 'Tuition Fee - Semester V', amount: 3800, paidAmount: 3800, dueDate: '2026-09-30', paidDate: '2026-09-08', status: 'PAID', receiptNo: 'REC-2026-4410', paymentMode: 'Credit Card' },
  { id: 'fee-4', studentId: 'stu-2', studentCode: 'STU-2026-002', studentName: 'Sophia Chen', feeType: 'Library & Online Journals Fee', amount: 450, paidAmount: 0, dueDate: '2026-10-15', status: 'PENDING' },
  { id: 'fee-5', studentId: 'stu-3', studentCode: 'STU-2026-003', studentName: 'Marcus Washington', feeType: 'Tuition Fee - Semester V', amount: 3800, paidAmount: 2600, dueDate: '2026-09-15', paidDate: '2026-09-10', status: 'PARTIAL', receiptNo: 'REC-2026-4422', paymentMode: 'Cheque' },
  { id: 'fee-6', studentId: 'stu-5', studentCode: 'STU-2026-005', studentName: 'Devon Patel', feeType: 'Admission & First Semester Tuition', amount: 4200, paidAmount: 1700, dueDate: '2026-09-01', paidDate: '2026-08-25', status: 'OVERDUE' },
];

const academicRecords: AcademicRecord[] = [
  { id: 'acad-1', studentId: 'stu-1', studentCode: 'STU-2026-001', studentName: 'Alex Rivera', currentSemester: 5, gpa: 3.85, cgpa: 3.78, creditsCompleted: 94, totalCredits: 160, standing: "Dean's List", remarks: 'Consistently high performance in computing systems.' },
  { id: 'acad-2', studentId: 'stu-2', studentCode: 'STU-2026-002', studentName: 'Sophia Chen', currentSemester: 5, gpa: 3.92, cgpa: 3.90, creditsCompleted: 96, totalCredits: 160, standing: "Dean's List", remarks: 'Ranked #1 in CSE Department.' },
  { id: 'acad-3', studentId: 'stu-3', studentCode: 'STU-2026-003', studentName: 'Marcus Washington', currentSemester: 5, gpa: 3.25, cgpa: 3.30, creditsCompleted: 88, totalCredits: 160, standing: 'Good Standing', remarks: 'Active in robotics society.' },
  { id: 'acad-4', studentId: 'stu-4', studentCode: 'STU-2026-004', studentName: 'Emily Watson', currentSemester: 3, gpa: 3.65, cgpa: 3.60, creditsCompleted: 52, totalCredits: 160, standing: 'Good Standing', remarks: 'Commendable circuit laboratory work.' },
  { id: 'acad-5', studentId: 'stu-5', studentCode: 'STU-2026-005', studentName: 'Devon Patel', currentSemester: 1, gpa: 3.70, cgpa: 3.70, creditsCompleted: 18, totalCredits: 160, standing: 'Good Standing', remarks: 'Enthusiastic freshman learner.' },
];

class DatabaseService {
  private state: DatabaseState = {
    users,
    departments: depts,
    courses,
    subjects,
    teachers,
    students,
    attendances,
    examinations,
    marks,
    fees,
    academicRecords,
  };

  // Auth operations
  async findUserByUsernameOrEmail(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    return this.state.users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    ) || null;
  }

  async verifyCredentials(identifier: string, pass: string) {
    const user = await this.findUserByUsernameOrEmail(identifier);
    if (!user) return null;
    const hash = hashPassword(pass);
    if (user.passwordHash !== hash) return null;

    // strip passwordHash
    const { passwordHash, ...safeUser } = user;
    return safeUser as User;
  }

  // Students operations
  async getStudents(filters?: {
    search?: string;
    departmentId?: string;
    courseId?: string;
    year?: number;
    status?: StudentStatus;
  }) {
    let list = [...this.state.students];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.departmentName.toLowerCase().includes(q) ||
          s.courseName.toLowerCase().includes(q)
      );
    }
    if (filters?.departmentId) {
      list = list.filter((s) => s.departmentId === filters.departmentId);
    }
    if (filters?.courseId) {
      list = list.filter((s) => s.courseId === filters.courseId);
    }
    if (filters?.year) {
      list = list.filter((s) => s.year === Number(filters.year));
    }
    if (filters?.status) {
      list = list.filter((s) => s.status === filters.status);
    }

    // Refresh computed metrics dynamically
    return list.map((student) => {
      const studentAtts = this.state.attendances.filter((a) => a.studentId === student.id);
      const totalAtts = studentAtts.length;
      const presentCount = studentAtts.filter((a) => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
      const attendanceRate = totalAtts > 0 ? Math.round((presentCount / totalAtts) * 1000) / 10 : (student.attendanceRate || 90);

      const pendingFees = this.state.fees
        .filter((f) => f.studentId === student.id && (f.status === 'PENDING' || f.status === 'PARTIAL' || f.status === 'OVERDUE'))
        .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

      const acad = this.state.academicRecords.find((a) => a.studentId === student.id);

      return {
        ...student,
        attendanceRate,
        pendingFeeAmount: pendingFees,
        gpa: acad ? acad.gpa : student.gpa,
        cgpa: acad ? acad.cgpa : student.cgpa,
      };
    });
  }

  async getStudentById(id: string) {
    const student = this.state.students.find((s) => s.id === id || s.studentId === id || s.userId === id);
    if (!student) return null;

    const attendances = this.state.attendances.filter((a) => a.studentId === student.id);
    const marks = this.state.marks.filter((m) => m.studentId === student.id);
    const fees = this.state.fees.filter((f) => f.studentId === student.id);
    const academicRecord = this.state.academicRecords.find((a) => a.studentId === student.id);

    return {
      ...student,
      attendances,
      marks,
      fees,
      academicRecord,
    };
  }

  async createStudent(payload: {
    name: string;
    email: string;
    phone?: string;
    departmentId: string;
    courseId: string;
    year: number;
    section: string;
    dateOfBirth?: string;
    address?: string;
    guardianName?: string;
    guardianPhone?: string;
    bloodGroup?: string;
    status?: StudentStatus;
    password?: string;
  }) {
    const dept = this.state.departments.find((d) => d.id === payload.departmentId);
    const crs = this.state.courses.find((c) => c.id === payload.courseId);
    const count = this.state.students.length + 1;
    const studentCode = `STU-2026-${count.toString().padStart(3, '0')}`;
    const newStudentId = `stu-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;

    // Create User record for auth
    const newUser: User & { passwordHash: string } = {
      id: newUserId,
      username: studentCode.toLowerCase(),
      email: payload.email,
      name: payload.name,
      role: 'STUDENT',
      studentId: studentCode,
      phone: payload.phone,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(payload.password || 'student123'),
    };
    this.state.users.push(newUser);

    const newStudent: Student = {
      id: newStudentId,
      studentId: studentCode,
      userId: newUserId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || '',
      departmentId: payload.departmentId,
      departmentName: dept ? dept.name : 'General Department',
      courseId: payload.courseId,
      courseName: crs ? crs.name : 'General Course',
      year: payload.year || 1,
      section: payload.section || 'A',
      dateOfBirth: payload.dateOfBirth,
      address: payload.address,
      guardianName: payload.guardianName,
      guardianPhone: payload.guardianPhone,
      bloodGroup: payload.bloodGroup,
      status: payload.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      attendanceRate: 100,
      gpa: 4.0,
      cgpa: 4.0,
      pendingFeeAmount: 3800,
    };
    this.state.students.push(newStudent);

    // Initial Academic Record
    this.state.academicRecords.push({
      id: `acad-${Date.now()}`,
      studentId: newStudentId,
      studentCode,
      studentName: payload.name,
      currentSemester: (payload.year - 1) * 2 + 1,
      gpa: 4.0,
      cgpa: 4.0,
      creditsCompleted: (payload.year - 1) * 40,
      totalCredits: 160,
      standing: 'Good Standing',
      remarks: 'Newly admitted student record.',
    });

    // Initial Fee Record
    this.state.fees.push({
      id: `fee-${Date.now()}`,
      studentId: newStudentId,
      studentCode,
      studentName: payload.name,
      feeType: 'Initial Term Tuition Fee',
      amount: 3800,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PENDING',
    });

    return newStudent;
  }

  async updateStudent(id: string, updates: Partial<Student>) {
    const idx = this.state.students.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const current = this.state.students[idx];
    const dept = updates.departmentId ? this.state.departments.find((d) => d.id === updates.departmentId) : undefined;
    const crs = updates.courseId ? this.state.courses.find((c) => c.id === updates.courseId) : undefined;

    const updated = {
      ...current,
      ...updates,
      departmentName: dept ? dept.name : current.departmentName,
      courseName: crs ? crs.name : current.courseName,
    };
    this.state.students[idx] = updated;

    // Keep user record in sync
    const userIdx = this.state.users.findIndex((u) => u.id === current.userId);
    if (userIdx !== -1) {
      if (updates.name) this.state.users[userIdx].name = updates.name;
      if (updates.email) this.state.users[userIdx].email = updates.email;
      if (updates.phone) this.state.users[userIdx].phone = updates.phone;
    }

    return updated;
  }

  async deleteStudent(id: string) {
    const idx = this.state.students.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    const student = this.state.students[idx];
    // Remove user
    this.state.users = this.state.users.filter((u) => u.id !== student.userId);
    // Remove attendances
    this.state.attendances = this.state.attendances.filter((a) => a.studentId !== id);
    // Remove marks
    this.state.marks = this.state.marks.filter((m) => m.studentId !== id);
    // Remove fees
    this.state.fees = this.state.fees.filter((f) => f.studentId !== id);
    // Remove academic records
    this.state.academicRecords = this.state.academicRecords.filter((a) => a.studentId !== id);
    // Remove student
    this.state.students.splice(idx, 1);

    return true;
  }

  // Teachers operations
  async getTeachers(filters?: { search?: string; departmentId?: string }) {
    let list = [...this.state.teachers];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.teacherId.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.designation.toLowerCase().includes(q) ||
          t.departmentName.toLowerCase().includes(q)
      );
    }
    if (filters?.departmentId) {
      list = list.filter((t) => t.departmentId === filters.departmentId);
    }

    return list.map((t) => ({
      ...t,
      subjects: this.state.subjects.filter((s) => s.teacherId === t.id),
    }));
  }

  async getTeacherById(id: string) {
    const teacher = this.state.teachers.find((t) => t.id === id || t.teacherId === id || t.userId === id);
    if (!teacher) return null;
    return {
      ...teacher,
      subjects: this.state.subjects.filter((s) => s.teacherId === teacher.id),
    };
  }

  async createTeacher(payload: {
    name: string;
    email: string;
    phone?: string;
    departmentId: string;
    designation: string;
    specialization?: string;
    password?: string;
  }) {
    const dept = this.state.departments.find((d) => d.id === payload.departmentId);
    const count = this.state.teachers.length + 1;
    const teacherCode = `TCH-2026-${count.toString().padStart(3, '0')}`;
    const newTeacherId = `tch-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;

    // Create user
    const newUser: User & { passwordHash: string } = {
      id: newUserId,
      username: teacherCode.toLowerCase(),
      email: payload.email,
      name: payload.name,
      role: 'TEACHER',
      teacherId: teacherCode,
      phone: payload.phone,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(payload.password || 'teacher123'),
    };
    this.state.users.push(newUser);

    const newTeacher: Teacher = {
      id: newTeacherId,
      teacherId: teacherCode,
      userId: newUserId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      departmentId: payload.departmentId,
      departmentName: dept ? dept.name : 'General Department',
      designation: payload.designation,
      specialization: payload.specialization,
      joiningDate: new Date().toISOString().split('T')[0],
      subjectsCount: 0,
    };
    this.state.teachers.push(newTeacher);

    return newTeacher;
  }

  async updateTeacher(id: string, updates: Partial<Teacher>) {
    const idx = this.state.teachers.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const current = this.state.teachers[idx];
    const dept = updates.departmentId ? this.state.departments.find((d) => d.id === updates.departmentId) : undefined;

    const updated = {
      ...current,
      ...updates,
      departmentName: dept ? dept.name : current.departmentName,
    };
    this.state.teachers[idx] = updated;

    const userIdx = this.state.users.findIndex((u) => u.id === current.userId);
    if (userIdx !== -1) {
      if (updates.name) this.state.users[userIdx].name = updates.name;
      if (updates.email) this.state.users[userIdx].email = updates.email;
      if (updates.phone) this.state.users[userIdx].phone = updates.phone;
    }

    return updated;
  }

  async deleteTeacher(id: string) {
    const idx = this.state.teachers.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const teacher = this.state.teachers[idx];
    this.state.users = this.state.users.filter((u) => u.id !== teacher.userId);
    // Detach subjects
    this.state.subjects.forEach((s) => {
      if (s.teacherId === id) {
        s.teacherId = undefined;
        s.teacherName = undefined;
      }
    });
    this.state.teachers.splice(idx, 1);
    return true;
  }

  // Attendance operations
  async getAttendance(filters?: {
    studentId?: string;
    subjectId?: string;
    courseId?: string;
    date?: string;
    status?: AttendanceStatus;
  }) {
    let list = [...this.state.attendances];
    if (filters?.studentId) {
      list = list.filter((a) => a.studentId === filters.studentId || a.studentCode === filters.studentId);
    }
    if (filters?.subjectId) {
      list = list.filter((a) => a.subjectId === filters.subjectId);
    }
    if (filters?.courseId) {
      list = list.filter((a) => a.courseId === filters.courseId);
    }
    if (filters?.date) {
      list = list.filter((a) => a.date === filters.date);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async recordAttendanceBatch(records: {
    studentId: string;
    subjectId: string;
    courseId?: string;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
    markedByName?: string;
  }[]) {
    const results: AttendanceRecord[] = [];

    for (const item of records) {
      const student = this.state.students.find((s) => s.id === item.studentId || s.studentId === item.studentId);
      const subject = this.state.subjects.find((sub) => sub.id === item.subjectId);

      if (!student || !subject) continue;

      const existingIdx = this.state.attendances.findIndex(
        (a) => a.studentId === student.id && a.subjectId === subject.id && a.date === item.date
      );

      const record: AttendanceRecord = {
        id: existingIdx !== -1 ? this.state.attendances[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId: student.id,
        studentCode: student.studentId,
        studentName: student.name,
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        courseId: item.courseId || student.courseId,
        date: item.date,
        status: item.status,
        remarks: item.remarks,
        markedByName: item.markedByName || 'Faculty Member',
      };

      if (existingIdx !== -1) {
        this.state.attendances[existingIdx] = record;
      } else {
        this.state.attendances.push(record);
      }
      results.push(record);
    }

    return results;
  }

  // Examinations & Marks operations
  async getExaminations() {
    return [...this.state.examinations];
  }

  async createExamination(exam: Omit<Examination, 'id'>) {
    const newExam: Examination = {
      ...exam,
      id: `exam-${Date.now()}`,
    };
    this.state.examinations.push(newExam);
    return newExam;
  }

  async getMarks(filters?: { examinationId?: string; subjectId?: string; studentId?: string }) {
    let list = [...this.state.marks];
    if (filters?.examinationId) {
      list = list.filter((m) => m.examinationId === filters.examinationId);
    }
    if (filters?.subjectId) {
      list = list.filter((m) => m.subjectId === filters.subjectId);
    }
    if (filters?.studentId) {
      list = list.filter((m) => m.studentId === filters.studentId || m.studentCode === filters.studentId);
    }
    return list;
  }

  calculateGrade(score: number, maxScore: number = 100): string {
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  }

  async saveBatchMarks(entries: {
    studentId: string;
    examinationId: string;
    subjectId: string;
    marksObtained: number;
    remarks?: string;
  }[]) {
    const results: MarkRecord[] = [];

    for (const entry of entries) {
      const student = this.state.students.find((s) => s.id === entry.studentId || s.studentId === entry.studentId);
      const exam = this.state.examinations.find((e) => e.id === entry.examinationId);
      const subject = this.state.subjects.find((sub) => sub.id === entry.subjectId);

      if (!student || !exam || !subject) continue;

      const grade = this.calculateGrade(entry.marksObtained, exam.totalMarks);

      const existingIdx = this.state.marks.findIndex(
        (m) => m.studentId === student.id && m.examinationId === exam.id && m.subjectId === subject.id
      );

      const record: MarkRecord = {
        id: existingIdx !== -1 ? this.state.marks[existingIdx].id : `mrk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId: student.id,
        studentCode: student.studentId,
        studentName: student.name,
        examinationId: exam.id,
        examinationName: exam.name,
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        marksObtained: entry.marksObtained,
        totalMarks: exam.totalMarks,
        grade,
        remarks: entry.remarks,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx !== -1) {
        this.state.marks[existingIdx] = record;
      } else {
        this.state.marks.push(record);
      }
      results.push(record);
    }

    return results;
  }

  // Fees operations
  async getFees(filters?: { studentId?: string; status?: FeeStatus }) {
    let list = [...this.state.fees];
    if (filters?.studentId) {
      list = list.filter((f) => f.studentId === filters.studentId || f.studentCode === filters.studentId);
    }
    if (filters?.status) {
      list = list.filter((f) => f.status === filters.status);
    }
    return list;
  }

  async createFee(payload: {
    studentId: string;
    feeType: string;
    amount: number;
    dueDate: string;
  }) {
    const student = this.state.students.find((s) => s.id === payload.studentId || s.studentId === payload.studentId);
    if (!student) return null;

    const newFee: FeeRecord = {
      id: `fee-${Date.now()}`,
      studentId: student.id,
      studentCode: student.studentId,
      studentName: student.name,
      feeType: payload.feeType,
      amount: payload.amount,
      paidAmount: 0,
      dueDate: payload.dueDate,
      status: 'PENDING',
    };
    this.state.fees.push(newFee);
    return newFee;
  }

  async recordPayment(id: string, payment: {
    amount: number;
    paymentMode: string;
    receiptNo?: string;
  }) {
    const idx = this.state.fees.findIndex((f) => f.id === id);
    if (idx === -1) return null;

    const fee = this.state.fees[idx];
    const newPaid = fee.paidAmount + payment.amount;
    let status: FeeStatus = 'PARTIAL';
    if (newPaid >= fee.amount) {
      status = 'PAID';
    }

    const updated: FeeRecord = {
      ...fee,
      paidAmount: newPaid,
      status,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMode: payment.paymentMode,
      receiptNo: payment.receiptNo || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    this.state.fees[idx] = updated;
    return updated;
  }

  // Academic Records operations
  async getAcademicRecords(filters?: { studentId?: string }) {
    let list = [...this.state.academicRecords];
    if (filters?.studentId) {
      list = list.filter((a) => a.studentId === filters.studentId || a.studentCode === filters.studentId);
    }
    return list;
  }

  async updateAcademicRecord(id: string, updates: Partial<AcademicRecord>) {
    const idx = this.state.academicRecords.findIndex((a) => a.id === id || a.studentId === id);
    if (idx === -1) return null;

    const updated = {
      ...this.state.academicRecords[idx],
      ...updates,
    };
    this.state.academicRecords[idx] = updated;
    return updated;
  }

  // Dashboard Aggregates
  async getAdminStats() {
    const totalStudents = this.state.students.length;
    const totalTeachers = this.state.teachers.length;
    const totalCourses = this.state.courses.length;
    const activeExams = this.state.examinations.length;

    // Overall attendance rate
    const totalAtt = this.state.attendances.length;
    const presentAtt = this.state.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
    const overallAttendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 1000) / 10 : 92.4;

    // Fees calculation
    const totalFeesExpected = this.state.fees.reduce((sum, f) => sum + f.amount, 0);
    const totalFeesCollected = this.state.fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalFeesPending = totalFeesExpected - totalFeesCollected;

    // Department breakdown
    const departmentBreakdown = this.state.departments.map((dept) => ({
      department: dept.code,
      count: this.state.students.filter((s) => s.departmentId === dept.id).length,
    }));

    const recentActivities = [
      { id: 'act-1', action: 'Attendance Recorded', detail: 'Prof. Sarah Jenkins marked attendance for CS-301', timestamp: '2 hours ago', type: 'attendance' as const },
      { id: 'act-2', action: 'Examination Marks Published', detail: 'End-Semester Finals grades updated for Alex Rivera', timestamp: '4 hours ago', type: 'exam' as const },
      { id: 'act-3', action: 'Fee Payment Received', detail: 'Sophia Chen paid $3,800 Tuition Fee (REC-2026-4410)', timestamp: '1 day ago', type: 'fee' as const },
      { id: 'act-4', action: 'Student Enrolled', detail: 'Devon Patel registered in Information Technology', timestamp: '2 days ago', type: 'student' as const },
    ];

    return {
      totalStudents,
      totalTeachers,
      totalCourses,
      activeExams,
      overallAttendanceRate,
      totalFeesExpected,
      totalFeesCollected,
      totalFeesPending,
      departmentBreakdown,
      recentActivities,
    };
  }

  async getTeacherStats(teacherId?: string) {
    const teacher = this.state.teachers.find((t) => t.id === teacherId || t.teacherId === teacherId || t.userId === teacherId) || this.state.teachers[0];
    const mySubjects = teacher ? this.state.subjects.filter((s) => s.teacherId === teacher.id) : this.state.subjects.slice(0, 2);

    // Get unique students enrolled in these courses
    const courseIds = new Set(mySubjects.map((s) => s.courseId));
    const relevantStudents = this.state.students.filter((s) => courseIds.has(s.courseId));

    // Attendance stats for teacher's subjects
    const teacherSubjectIds = new Set(mySubjects.map((s) => s.id));
    const teacherAtts = this.state.attendances.filter((a) => teacherSubjectIds.has(a.subjectId));
    const presentCount = teacherAtts.filter((a) => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
    const averageClassAttendance = teacherAtts.length > 0 ? Math.round((presentCount / teacherAtts.length) * 1000) / 10 : 94.0;

    return {
      totalAssignedStudents: relevantStudents.length,
      assignedStudentsCount: relevantStudents.length,
      classesToday: 2,
      averageAttendanceRate: averageClassAttendance,
      averageClassAttendance,
      pendingMarksCount: 1,
      pendingMarksSubmission: 1,
      subjectsTaught: mySubjects,
      assignedSubjects: mySubjects,
    };
  }

  async getStudentStats(studentIdentifier: string) {
    const student = this.state.students.find(
      (s) => s.id === studentIdentifier || s.studentId === studentIdentifier || s.userId === studentIdentifier
    ) || this.state.students[0];

    const studentAtts = this.state.attendances.filter((a) => a.studentId === student.id);
    const totalClasses = studentAtts.length;
    const presentClasses = studentAtts.filter((a) => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
    const absentClasses = totalClasses - presentClasses;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 1000) / 10 : 92.5;

    const acad = this.state.academicRecords.find((a) => a.studentId === student.id);
    const pendingFees = this.state.fees
      .filter((f) => f.studentId === student.id && (f.status === 'PENDING' || f.status === 'PARTIAL' || f.status === 'OVERDUE'))
      .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

    const recentResults = this.state.marks
      .filter((m) => m.studentId === student.id)
      .slice(0, 5);

    const enrolledSubjects = this.state.subjects.filter((s) => s.courseId === student.courseId);
    if (enrolledSubjects.length === 0) {
      enrolledSubjects.push(...this.state.subjects.slice(0, 3));
    }

    return {
      student,
      enrolledSubjects,
      overallAttendanceRate: attendancePercentage,
      attendancePercentage,
      totalClasses,
      presentClasses,
      absentClasses,
      gpa: acad ? acad.gpa : student.gpa || 3.85,
      cgpa: acad ? acad.cgpa : student.cgpa || 3.78,
      creditsEarned: acad ? acad.creditsCompleted : 94,
      pendingFeeAmount: pendingFees,
      pendingFees,
      academicStanding: acad ? acad.standing : 'Good Standing',
      recentMarks: recentResults,
      recentResults,
    };
  }

  // Lookups
  async getDepartments() {
    return [...this.state.departments];
  }

  async getCourses() {
    return [...this.state.courses];
  }

  async getSubjects() {
    return [...this.state.subjects];
  }
}

export const dbService = new DatabaseService();
