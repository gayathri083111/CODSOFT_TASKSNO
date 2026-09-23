// EduManage Seed Script for Prisma & PostgreSQL
import { PrismaClient, Role, StudentStatus, AttendanceStatus, FeeStatus, ExamType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding EduManage database...');

  // Clean existing records if any
  await prisma.marks.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Departments
  const cseDept = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      code: 'ECE',
      name: 'Electronics and Communication Engineering',
    },
  });

  // 2. Create Courses
  const btechCse = await prisma.course.create({
    data: {
      code: 'BTECH-CSE',
      name: 'B.Tech in Computer Science',
      departmentId: cseDept.id,
      durationYrs: 4,
    },
  });

  const btechEce = await prisma.course.create({
    data: {
      code: 'BTECH-ECE',
      name: 'B.Tech in Electronics & Comm',
      departmentId: eceDept.id,
      durationYrs: 4,
    },
  });

  // 3. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@edumanage.edu',
      username: 'admin',
      password: hashPassword('admin123'),
      role: Role.ADMIN,
      name: 'Dr. Arthur Pendelton',
      phone: '+1 (555) 234-5678',
    },
  });

  // 4. Create Teacher User & Profile
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'teacher@edumanage.edu',
      username: 'teacher',
      password: hashPassword('teacher123'),
      role: Role.TEACHER,
      name: 'Prof. Sarah Jenkins',
      phone: '+1 (555) 345-6789',
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      teacherId: 'TCH-2026-001',
      userId: teacherUser1.id,
      departmentId: cseDept.id,
      designation: 'Professor',
      specialization: 'Artificial Intelligence & Distributed Systems',
    },
  });

  // 5. Create Subjects
  const subDb = await prisma.subject.create({
    data: {
      code: 'CS-301',
      name: 'Database Management Systems',
      credits: 4,
      semester: 5,
      courseId: btechCse.id,
      teacherId: teacher1.id,
    },
  });

  const subAlgo = await prisma.subject.create({
    data: {
      code: 'CS-302',
      name: 'Design and Analysis of Algorithms',
      credits: 4,
      semester: 5,
      courseId: btechCse.id,
      teacherId: teacher1.id,
    },
  });

  // 6. Create Student User & Profile
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@edumanage.edu',
      username: 'student',
      password: hashPassword('student123'),
      role: Role.STUDENT,
      name: 'Alex Rivera',
      phone: '+1 (555) 890-1234',
    },
  });

  const student1 = await prisma.student.create({
    data: {
      studentId: 'STU-2026-001',
      userId: studentUser1.id,
      departmentId: cseDept.id,
      courseId: btechCse.id,
      year: 3,
      section: 'A',
      address: '742 Evergreen Terrace, Springfield',
      status: StudentStatus.ACTIVE,
    },
  });

  // 7. Academic Record
  await prisma.academicRecord.create({
    data: {
      studentId: student1.id,
      currentSemester: 5,
      gpa: 3.85,
      cgpa: 3.78,
      creditsCompleted: 92,
      totalCredits: 160,
      standing: "Dean's List",
    },
  });

  // 8. Fee Record
  await prisma.feeRecord.create({
    data: {
      studentId: student1.id,
      feeType: 'Tuition Fee - Fall 2026',
      amount: 4500.0,
      paidAmount: 4500.0,
      dueDate: new Date('2026-09-30'),
      paidDate: new Date('2026-09-10'),
      status: FeeStatus.PAID,
      receiptNo: 'REC-2026-9081',
      paymentMode: 'Online NetBanking',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
