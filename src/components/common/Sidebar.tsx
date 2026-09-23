import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck2,
  FileSpreadsheet,
  Receipt,
  Award,
  User,
  BookOpen,
  ArrowLeftRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Role } from '../../types.ts';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const getNavItems = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Students', path: '/admin/students', icon: Users },
          { label: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
          { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck2 },
          { label: 'Examinations', path: '/admin/examinations', icon: FileSpreadsheet },
          { label: 'Fee Management', path: '/admin/fees', icon: Receipt },
          { label: 'Academic Records', path: '/admin/academic-records', icon: Award },
        ];
      case 'TEACHER':
        return [
          { label: 'Overview', path: '/teacher/dashboard', icon: LayoutDashboard },
          { label: 'Assigned Students', path: '/teacher/students', icon: Users },
          { label: 'Mark Attendance', path: '/teacher/attendance', icon: CalendarCheck2 },
          { label: 'Enter Exam Marks', path: '/teacher/examinations', icon: FileSpreadsheet },
          { label: 'Academic Records', path: '/teacher/academic-records', icon: Award },
        ];
      case 'STUDENT':
        return [
          { label: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'My Profile', path: '/student/profile', icon: User },
          { label: 'My Attendance', path: '/student/attendance', icon: CalendarCheck2 },
          { label: 'Exam Results', path: '/student/results', icon: FileSpreadsheet },
          { label: 'Fee Status', path: '/student/fees', icon: Receipt },
          { label: 'Academic Record', path: '/student/academic-records', icon: Award },
        ];
    }
  };

  const navItems = getNavItems(user.role);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Role Banner */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold text-slate-800 tracking-wide">{user.role} CONTROL PANEL</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                onNavigate(item.path);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Quick Exit */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-1">
        <button
          onClick={() => {
            onNavigate('/');
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          <span>Switch Role Portal</span>
        </button>

        <button
          onClick={() => {
            logout();
            onNavigate('/');
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-61px)] shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
