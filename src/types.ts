export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type FeeStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
export type ExamType = 'MID_TERM' | 'FINAL_SEMESTER' | 'UNIT_TEST' | 'PRACTICAL';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  studentId?: string; // STU-2026-001 if role is STUDENT
  teacherId?: string; // TCH-2026-001 if role is TEACHER
}

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  durationYrs: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  courseId: string;
  courseName?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface Student {
  id: string;
  studentId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName: string;
  courseId: string;
  courseName: string;
  year: number;
  section: string;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  status: StudentStatus;
  createdAt: string;
  // Computed aggregations for quick view
  attendanceRate?: number;
  gpa?: number;
  cgpa?: number;
  pendingFeeAmount?: number;
}

export interface Teacher {
  id: string;
  teacherId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  specialization?: string;
  joiningDate: string;
  subjectsCount?: number;
  subjects?: Subject[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedByName?: string;
}

export interface Examination {
  id: string;
  code: string;
  name: string;
  type: ExamType;
  semester: number;
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
}

export interface MarkRecord {
  id: string;
  studentId: string;
  studentCode?: string;
  studentRoll?: string;
  studentName?: string;
  examinationId: string;
  examinationName?: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks?: string;
  updatedAt?: string;
}

export type Mark = MarkRecord;

export interface FeeRecord {
  id: string;
  studentId: string;
  studentCode?: string;
  studentRoll?: string;
  studentName?: string;
  feeType: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  paidDate?: string;
  status: FeeStatus;
  receiptNo?: string;
  paymentMode?: string;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  studentCode?: string;
  studentRoll?: string;
  studentName?: string;
  courseName?: string;
  departmentName?: string;
  semester?: number;
  currentSemester?: number;
  gpa: number;
  cgpa: number;
  creditsCompleted: number;
  totalCredits: number;
  standing: string;
  remarks?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  activeExams: number;
  overallAttendanceRate: number;
  totalFeesExpected: number;
  totalFeesCollected: number;
  totalFeesPending: number;
  departmentBreakdown: { department: string; count: number }[];
  recentActivities: {
    id: string;
    action: string;
    detail: string;
    timestamp: string;
    type: 'student' | 'teacher' | 'fee' | 'exam' | 'attendance';
  }[];
}

export interface TeacherStats {
  assignedStudentsCount?: number;
  totalAssignedStudents?: number;
  classesToday?: number;
  averageClassAttendance?: number;
  averageAttendanceRate?: number;
  pendingMarksSubmission?: number;
  pendingMarksCount?: number;
  subjectsTaught?: Subject[];
  assignedSubjects: Subject[];
}

export interface StudentStats {
  student: Student;
  enrolledSubjects: Subject[];
  overallAttendanceRate: number;
  attendancePercentage?: number;
  totalClasses?: number;
  presentClasses?: number;
  absentClasses?: number;
  gpa: number;
  cgpa: number;
  creditsEarned?: number;
  pendingFees?: number;
  pendingFeeAmount?: number;
  academicStanding?: string;
  recentResults?: MarkRecord[];
  recentMarks?: MarkRecord[];
}
