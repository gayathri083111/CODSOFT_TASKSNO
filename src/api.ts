import { Role } from './types.ts';

const TOKEN_KEY = 'edumanage_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || (typeof data === 'string' ? data : `Request failed with status ${response.status}`);
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (username: string, password: string, role?: Role) =>
    request<{ token: string; user: any; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),
  getMe: () => request<{ user: any }>('/api/auth/me'),
  getDemoCredentials: () => request<Record<string, any>>('/api/auth/demo-credentials'),

  // Stats
  getAdminStats: () => request<any>('/api/stats/admin'),
  getTeacherStats: () => request<any>('/api/stats/teacher'),
  getStudentStats: (studentId?: string) =>
    request<any>(`/api/stats/student${studentId ? `?studentId=${studentId}` : ''}`),

  // Students
  getStudents: (params?: { search?: string; departmentId?: string; courseId?: string; year?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.courseId) query.append('courseId', params.courseId);
    if (params?.year) query.append('year', String(params.year));
    if (params?.status) query.append('status', params.status);
    return request<any[]>(`/api/students?${query.toString()}`);
  },
  getStudentById: (id: string) => request<any>(`/api/students/${id}`),
  createStudent: (data: any) =>
    request<any>('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStudent: (id: string, data: any) =>
    request<any>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteStudent: (id: string) =>
    request<any>(`/api/students/${id}`, {
      method: 'DELETE',
    }),

  // Teachers
  getTeachers: (params?: { search?: string; departmentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    return request<any[]>(`/api/teachers?${query.toString()}`);
  },
  getTeacherById: (id: string) => request<any>(`/api/teachers/${id}`),
  createTeacher: (data: any) =>
    request<any>('/api/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTeacher: (id: string, data: any) =>
    request<any>(`/api/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTeacher: (id: string) =>
    request<any>(`/api/teachers/${id}`, {
      method: 'DELETE',
    }),

  // Lookups
  getDepartments: () => request<any[]>('/api/departments'),
  getCourses: () => request<any[]>('/api/courses'),
  getSubjects: () => request<any[]>('/api/subjects'),

  // Attendance
  getAttendance: (params?: { studentId?: string; subjectId?: string; courseId?: string; date?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.subjectId) query.append('subjectId', params.subjectId);
    if (params?.courseId) query.append('courseId', params.courseId);
    if (params?.date) query.append('date', params.date);
    if (params?.status) query.append('status', params.status);
    return request<any[]>(`/api/attendance?${query.toString()}`);
  },
  markAttendanceBatch: (records: any[]) =>
    request<{ count: number; records: any[] }>('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ records }),
    }),

  // Examinations & Marks
  getExaminations: () => request<any[]>('/api/examinations'),
  createExamination: (data: any) =>
    request<any>('/api/examinations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMarks: (params?: { examinationId?: string; subjectId?: string; studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.examinationId) query.append('examinationId', params.examinationId);
    if (params?.subjectId) query.append('subjectId', params.subjectId);
    if (params?.studentId) query.append('studentId', params.studentId);
    return request<any[]>(`/api/marks?${query.toString()}`);
  },
  saveMarksBatch: (entries: any[]) =>
    request<{ count: number; marks: any[] }>('/api/marks/batch', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    }),

  // Fees
  getFees: (params?: { studentId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.status) query.append('status', params.status);
    return request<any[]>(`/api/fees?${query.toString()}`);
  },
  createFee: (data: any) =>
    request<any>('/api/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recordFeePayment: (id: string, payment: { amount: number; paymentMode?: string; receiptNo?: string }) =>
    request<any>(`/api/fees/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    }),

  // Academic Records
  getAcademicRecords: (params?: { studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    return request<any[]>(`/api/academic-records?${query.toString()}`);
  },
  updateAcademicRecord: (id: string, data: any) =>
    request<any>(`/api/academic-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
