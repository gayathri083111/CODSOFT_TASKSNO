/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Role } from './types.ts';
import { RoleSelection } from './components/RoleSelection.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';

// Admin views
import { AdminOverview } from './components/admin/AdminOverview.tsx';
import { AdminStudents } from './components/admin/AdminStudents.tsx';
import { AdminTeachers } from './components/admin/AdminTeachers.tsx';
import { AdminAttendance } from './components/admin/AdminAttendance.tsx';
import { AdminExaminations } from './components/admin/AdminExaminations.tsx';
import { AdminFees } from './components/admin/AdminFees.tsx';
import { AdminAcademicRecords } from './components/admin/AdminAcademicRecords.tsx';

// Teacher views
import { TeacherOverview } from './components/teacher/TeacherOverview.tsx';
import { TeacherStudents } from './components/teacher/TeacherStudents.tsx';
import { TeacherAttendance } from './components/teacher/TeacherAttendance.tsx';
import { TeacherMarks } from './components/teacher/TeacherMarks.tsx';
import { TeacherAcademicRecords } from './components/teacher/TeacherAcademicRecords.tsx';

// Student views
import { StudentOverview } from './components/student/StudentOverview.tsx';
import { StudentProfile } from './components/student/StudentProfile.tsx';
import { StudentAttendance } from './components/student/StudentAttendance.tsx';
import { StudentResults } from './components/student/StudentResults.tsx';
import { StudentFees } from './components/student/StudentFees.tsx';
import { StudentAcademicRecords } from './components/student/StudentAcademicRecords.tsx';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [loginRole, setLoginRole] = useState<Role | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync with browser hash / navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Redirect to role dashboard upon login
  useEffect(() => {
    if (user && (currentPath === '/' || currentPath.startsWith('/login'))) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'TEACHER') navigate('/teacher/dashboard');
      else if (user.role === 'STUDENT') navigate('/student/dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Initializing EduManage System...</p>
        </div>
      </div>
    );
  }

  // Not logged in: Show either RoleSelection or LoginPage
  if (!user) {
    if (loginRole) {
      return (
        <LoginPage
          role={loginRole}
          onBack={() => setLoginRole(null)}
          onSuccess={(role) => {
            setLoginRole(null);
            if (role === 'ADMIN') navigate('/admin/dashboard');
            else if (role === 'TEACHER') navigate('/teacher/dashboard');
            else if (role === 'STUDENT') navigate('/student/dashboard');
          }}
        />
      );
    }

    return (
      <RoleSelection
        onSelectRole={(role) => setLoginRole(role)}
        onNavigateToLogin={(role) => setLoginRole(role)}
      />
    );
  }

  // Role-based access control guard: verify if currentPath matches role
  const isAuthorizedPath = (path: string, role: Role) => {
    if (role === 'ADMIN' && path.startsWith('/admin')) return true;
    if (role === 'TEACHER' && path.startsWith('/teacher')) return true;
    if (role === 'STUDENT' && path.startsWith('/student')) return true;
    return false;
  };

  const getDefaultRolePath = (role: Role) => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'TEACHER') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  const activePath = isAuthorizedPath(currentPath, user.role)
    ? currentPath
    : getDefaultRolePath(user.role);

  // Render role-specific view
  const renderView = () => {
    // ADMIN VIEWS
    if (user.role === 'ADMIN') {
      switch (activePath) {
        case '/admin/students':
          return <AdminStudents />;
        case '/admin/teachers':
          return <AdminTeachers />;
        case '/admin/attendance':
          return <AdminAttendance />;
        case '/admin/examinations':
          return <AdminExaminations />;
        case '/admin/fees':
          return <AdminFees />;
        case '/admin/academic-records':
          return <AdminAcademicRecords />;
        case '/admin/dashboard':
        default:
          return <AdminOverview onNavigate={navigate} />;
      }
    }

    // TEACHER VIEWS
    if (user.role === 'TEACHER') {
      switch (activePath) {
        case '/teacher/students':
          return <TeacherStudents />;
        case '/teacher/attendance':
          return <TeacherAttendance />;
        case '/teacher/examinations':
          return <TeacherMarks />;
        case '/teacher/academic-records':
          return <TeacherAcademicRecords />;
        case '/teacher/dashboard':
        default:
          return <TeacherOverview onNavigate={navigate} />;
      }
    }

    // STUDENT VIEWS
    if (user.role === 'STUDENT') {
      switch (activePath) {
        case '/student/profile':
          return <StudentProfile />;
        case '/student/attendance':
          return <StudentAttendance />;
        case '/student/results':
          return <StudentResults />;
        case '/student/fees':
          return <StudentFees />;
        case '/student/academic-records':
          return <StudentAcademicRecords />;
        case '/student/dashboard':
        default:
          return <StudentOverview onNavigate={navigate} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <Header
        currentPath={activePath}
        onNavigate={navigate}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPath={activePath}
          onNavigate={navigate}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
