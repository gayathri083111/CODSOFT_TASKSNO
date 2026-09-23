import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  BookOpen,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Role } from '../../types.ts';

interface HeaderProps {
  onToggleSidebar?: () => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigate }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleColors: Record<Role, { badge: string; icon: any }> = {
    ADMIN: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Shield },
    TEACHER: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: BookOpen },
    STUDENT: { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: UserIcon },
  };

  const RoleIcon = user ? roleColors[user.role].icon : Shield;

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onNavigate?.('/')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xs group-hover:opacity-95 transition-opacity">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">EduManage</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  SMS
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 -mt-0.5">Centralized Education Management</p>
            </div>
          </button>
        </div>

        {/* Right: Role indicator, notification bell, user profile */}
        <div className="flex items-center gap-3">
          {user && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${roleColors[user.role].badge}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{user.role} PORTAL</span>
            </div>
          )}

          {/* Notifications button */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800">System Notifications</h4>
                  <span className="text-[11px] text-indigo-600 font-medium cursor-pointer">Mark read</span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-slate-700">
                    <p className="font-semibold text-indigo-900">Fall 2026 Examination Schedule</p>
                    <p className="text-slate-600 mt-0.5">Mid-term examinations start Oct 15. All faculty submit papers.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                    <p className="font-semibold text-slate-900">Fee Payment Reminder</p>
                    <p className="text-slate-600 mt-0.5">Semester V tuition fees are due by Sept 30, 2026.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {user ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[130px]">{user.name}</div>
                  <div className="text-[11px] text-slate-500">{user.username}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm">
                      {user.role}
                    </span>
                  </div>

                  <button
                    id="switch-role-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate?.('/');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    Switch Role / Home
                  </button>

                  <button
                    id="logout-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      onNavigate?.('/');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate?.('/')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
