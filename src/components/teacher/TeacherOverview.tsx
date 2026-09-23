import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck2,
  FileSpreadsheet,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../common/StatCard.tsx';
import { api } from '../../api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { TeacherStats } from '../../types.ts';

interface TeacherOverviewProps {
  onNavigate: (path: string) => void;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await api.getTeacherStats();
        setStats(data);
      } catch (err: any) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading faculty dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold border border-emerald-400/30 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Active Semester Term</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Review your assigned curriculum subjects, submit class attendance, and enter semester examination marks.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="teacher-quick-mark-attendance"
            onClick={() => onNavigate('/teacher/attendance')}
            className="px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Mark Attendance</span>
          </button>
          <button
            id="teacher-quick-enter-marks"
            onClick={() => onNavigate('/teacher/examinations')}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Enter Marks</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={stats?.totalAssignedStudents || 24}
          subtitle="Enrolled in your subjects"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Curriculum Subjects"
          value={stats?.assignedSubjects?.length ?? 2}
          subtitle="Under your instruction"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Class Attendance"
          value={`${stats?.averageAttendanceRate || 91}%`}
          subtitle="Subject average attendance"
          icon={CalendarCheck2}
          color="indigo"
          trend={{ value: '2.1%', isPositive: true }}
        />
        <StatCard
          title="Pending Evaluation"
          value={stats?.pendingMarksCount || 0}
          subtitle="Awaiting marks submission"
          icon={FileSpreadsheet}
          color="amber"
        />
      </div>

      {/* Assigned Subjects & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects list */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Assigned Subjects Catalog</span>
            </h3>
            <span className="text-xs text-slate-400">{stats?.assignedSubjects?.length ?? 0} Active Classes</span>
          </div>

          <div className="space-y-3">
            {(stats?.assignedSubjects ?? []).map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-sm">
                      {sub.code}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Semester {sub.semester} • {sub.credits} Academic Credits
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/teacher/attendance')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 shadow-2xs transition-colors flex items-center gap-1"
                >
                  <span>Attendance</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Action Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Instructor Tasks & Timeline</span>
              </h3>
              <span className="text-[11px] font-semibold text-indigo-600">Fall 2026</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Today's Attendance Recording</p>
                  <p className="text-slate-600 mt-0.5">Please take daily lecture roll call for CS301 (Data Structures).</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Mid-Term Marks Due</p>
                  <p className="text-slate-600 mt-0.5">Submit internal evaluation marks for upcoming examination.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Academic Advising</p>
                  <p className="text-slate-600 mt-0.5">Review low-attendance student warnings for timely intervention.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need academic administration support?</span>
            <span className="text-emerald-700 font-semibold cursor-pointer">Contact Dean</span>
          </div>
        </div>
      </div>
    </div>
  );
};
