import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  Plus,
  Clock,
  ArrowUpRight,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { StatCard } from '../common/StatCard.tsx';
import { api } from '../../api.ts';
import { AdminStats } from '../../types.ts';

interface AdminOverviewProps {
  onNavigate: (path: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
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
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading administrative statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 m-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
        <p className="font-semibold">Unable to fetch dashboard metrics</p>
        <p className="mt-1">{error || 'Server error occurred.'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time administrative overview of students, faculty, examinations, and institutional finances.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-quick-add-student"
            onClick={() => onNavigate('/admin/students')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            id="admin-quick-add-teacher"
            onClick={() => onNavigate('/admin/teachers')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
          <button
            id="admin-quick-record-fee"
            onClick={() => onNavigate('/admin/fees')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-students"
          title="Total Enrolled Students"
          value={stats.totalStudents}
          subtitle="Across 4 Degree Programs"
          icon={Users}
          color="indigo"
          trend={{ value: '12%', isPositive: true }}
        />
        <StatCard
          id="stat-total-teachers"
          title="Faculty Members"
          value={stats.totalTeachers}
          subtitle="Professors & Instructors"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          id="stat-attendance-rate"
          title="Campus Attendance Rate"
          value={`${stats.overallAttendanceRate}%`}
          subtitle="Overall Lecture Attendance"
          icon={CalendarCheck2}
          color="blue"
          trend={{ value: '1.4%', isPositive: true }}
        />
        <StatCard
          id="stat-pending-fees"
          title="Outstanding Fees"
          value={`$${stats.totalFeesPending.toLocaleString()}`}
          subtitle={`Collected: $${stats.totalFeesCollected.toLocaleString()}`}
          icon={Receipt}
          color="amber"
        />
      </div>

      {/* Financial Breakdown & Enrollment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Enrollment Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Enrollment</h3>
              <p className="text-xs text-slate-500">Student distribution by academic department</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/students')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {(stats?.departmentBreakdown ?? []).map((dept) => {
              const maxCount = Math.max(...(stats?.departmentBreakdown ?? []).map((d) => d.count), 1);
              const percentage = Math.round((dept.count / maxCount) * 100);
              return (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dept.department} Department</span>
                    <span className="text-slate-500">{dept.count} Students ({Math.round((dept.count / stats.totalStudents) * 100 || 0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Active Programs</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{stats.totalCourses} Courses</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Scheduled Exams</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{stats.activeExams} Active</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Tuition Compliance</p>
              <p className="text-base font-bold text-emerald-600 mt-0.5">
                {Math.round((stats.totalFeesCollected / (stats.totalFeesExpected || 1)) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Financial Collection Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Fee Accounts</h3>
                <p className="text-xs text-slate-500">Current semester ledger status</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Term
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500">Total Expected Fees</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">${stats.totalFeesExpected.toLocaleString()}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-xs text-emerald-700 font-medium">Realized Collections</p>
                <p className="text-xl font-bold text-emerald-800 mt-0.5">${stats.totalFeesCollected.toLocaleString()}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <p className="text-xs text-amber-700 font-medium">Pending Collections</p>
                <p className="text-xl font-bold text-amber-800 mt-0.5">${stats.totalFeesPending.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <button
            id="admin-btn-manage-fees"
            onClick={() => onNavigate('/admin/fees')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Fee Management Ledger</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Institutional Activities Stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Recent Institutional Operations</h3>
          </div>
          <span className="text-xs text-slate-400">Live Audit Log</span>
        </div>

        <div className="divide-y divide-slate-100">
          {(stats?.recentActivities ?? []).map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {act.action.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{act.action}</p>
                  <p className="text-xs text-slate-500">{act.detail}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
