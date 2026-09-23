import React from 'react';
import {
  ShieldCheck,
  GraduationCap,
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  LockKeyhole
} from 'lucide-react';
import { Role } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface RoleSelectionProps {
  onSelectRole: (role: Role) => void;
  onNavigateToLogin: (role: Role) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onNavigateToLogin,
}) => {
  const { quickDemoLogin } = useAuth();
  const [loadingRole, setLoadingRole] = React.useState<Role | null>(null);

  const handleQuickDemo = async (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoadingRole(role);
      await quickDemoLogin(role);
    } catch (err: any) {
      console.error('Quick demo failed:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  const roles = [
    {
      id: 'ADMIN' as Role,
      title: 'Administrator',
      badge: 'MANAGEMENT & GOVERNANCE',
      description:
        'Complete institutional authority to manage student & faculty records, attendance data, examination structures, fee ledgers, and academic standings.',
      icon: ShieldCheck,
      color: 'indigo',
      accentBg: 'bg-indigo-50/70',
      accentBorder: 'border-indigo-200',
      badgeClass: 'bg-indigo-100 text-indigo-800',
      btnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      credentials: 'admin / admin123',
      features: [
        'Student & Teacher Full CRUD',
        'Institutional Attendance Analytics',
        'Exam Schedules & Results Master',
        'Fee Collections & Dues Tracker',
        'Official Academic Transcripts',
      ],
    },
    {
      id: 'TEACHER' as Role,
      title: 'Faculty / Teacher',
      badge: 'ACADEMIC INSTRUCTION',
      description:
        'Manage designated student batches, record daily lecture attendance, compute & publish semester exam marks, and evaluate academic growth.',
      icon: GraduationCap,
      color: 'emerald',
      accentBg: 'bg-emerald-50/70',
      accentBorder: 'border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      credentials: 'teacher / teacher123',
      features: [
        'Assigned Student Rosters',
        '1-Click Interactive Attendance Marker',
        'Exam Marks Entry with Auto-Grading',
        'Performance & GPA Statistics',
        'Course Syllabus & Subject Tracking',
      ],
    },
    {
      id: 'STUDENT' as Role,
      title: 'Student Scholar',
      badge: 'STUDENT SELF-SERVICE',
      description:
        'Access personal academic profiles, monitor lecture attendance metrics, inspect semester report cards, and track tuition invoices.',
      icon: UserCheck,
      color: 'amber',
      accentBg: 'bg-amber-50/70',
      accentBorder: 'border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      credentials: 'student / student123',
      features: [
        'Personal Profile & Enrollment Status',
        'Real-Time Attendance % & History',
        'Official Exam Results & Grade Reports',
        'Fee Statements & Payment Receipts',
        'Cumulative CGPA Transcript',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Banner */}
      <header className="w-full bg-white border-b border-slate-200 py-3.5 px-6 sm:px-10 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">EduManage</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">CodSoft Full-Stack Web Development Task 1</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">Academic Year 2026-27</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <span className="font-medium text-slate-500">PostgreSQL + Prisma System</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Centralized Education Management System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="text-indigo-600">EduManage</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Please select your institutional role below to proceed to your dedicated portal.
            Each portal provides isolated role-based permissions, database-backed records, and automated workflows.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
          {roles.map((r) => {
            const Icon = r.icon;
            const isLoading = loadingRole === r.id;
            return (
              <div
                key={r.id}
                id={`role-card-${r.id.toLowerCase()}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Header */}
                <div className={`p-6 ${r.accentBg} border-b ${r.accentBorder}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${r.badgeClass}`}>
                      {r.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{r.title}</h2>
                  <p className="text-xs text-slate-600 mt-2 leading-normal min-h-[48px]">{r.description}</p>
                </div>

                {/* Features List */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Capabilities</p>
                    {r.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <button
                      id={`btn-login-${r.id.toLowerCase()}`}
                      onClick={() => onNavigateToLogin(r.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors ${r.btnClass}`}
                    >
                      <LockKeyhole className="w-4 h-4" />
                      <span>Login as {r.title.split(' ')[0]}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Instant Demo Auto-fill Helper */}
                    <button
                      id={`btn-demo-${r.id.toLowerCase()}`}
                      onClick={(e) => handleQuickDemo(r.id, e)}
                      disabled={isLoading}
                      className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isLoading ? 'Authenticating...' : `1-Click Demo Login (${r.credentials})`}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Credentials Helper Pill Bar */}
        <div className="mt-10 w-full max-w-3xl bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <LockKeyhole className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">Seed Demo Credentials:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 font-mono border border-indigo-100">
                Admin: admin / admin123
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono border border-emerald-100">
                Teacher: teacher / teacher123
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-mono border border-amber-100">
                Student: student / student123
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>EduManage • Centralized Education Management Platform • CodSoft Internship Task 1</p>
      </footer>
    </div>
  );
};
