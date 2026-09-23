import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CalendarCheck2,
  Award,
  Receipt,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';
import { StatCard } from '../common/StatCard.tsx';
import { api } from '../../api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { StudentStats } from '../../types.ts';

interface StudentOverviewProps {
  onNavigate: (path: string) => void;
}

export const StudentOverview: React.FC<StudentOverviewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.getStudentStats(user?.studentId);
        setStats(data);
      } catch (err) {
        console.error('Failed to load student dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading student scholar portal...</p>
        </div>
      </div>
    );
  }

  const attendanceRate = stats?.overallAttendanceRate || 92;
  const isAttendanceWarning = attendanceRate < 75;
  const hasFeePending = (stats?.pendingFeeAmount || 0) > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/15 text-amber-100 text-[11px] font-semibold border border-white/20 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Enrolled Scholar • Fall 2026</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{stats?.student.name}</h1>
          <p className="text-xs text-amber-100 mt-1">
            Roll: <span className="font-mono font-bold text-white">{stats?.student.studentId}</span> • {stats?.student.courseName} • Year {stats?.student.year} (Sec {stats?.student.section})
          </p>
        </div>

        {/* Quick link buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('/student/results')}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-amber-50 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>My Results</span>
          </button>
          <button
            onClick={() => onNavigate('/student/fees')}
            className="px-3.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold border border-white/20 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Fee Dues</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle={isAttendanceWarning ? 'Attendance below 75% threshold' : 'Good attendance standing'}
          icon={CalendarCheck2}
          color={isAttendanceWarning ? 'rose' : 'emerald'}
          trend={{ value: '1.2%', isPositive: !isAttendanceWarning }}
        />
        <StatCard
          title="Cumulative CGPA"
          value={stats?.cgpa ? stats.cgpa.toFixed(2) : '3.80'}
          subtitle={`Semester GPA: ${stats?.gpa ? stats.gpa.toFixed(2) : '3.85'}`}
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Enrolled Subjects"
          value={stats?.enrolledSubjects?.length ?? 2}
          subtitle="Total semester course load"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Fee Balance"
          value={hasFeePending ? `$${stats?.pendingFeeAmount?.toLocaleString()}` : '$0'}
          subtitle={hasFeePending ? 'Pending payment due' : 'All accounts cleared'}
          icon={Receipt}
          color={hasFeePending ? 'amber' : 'emerald'}
        />
      </div>

      {/* Important Alerts if any */}
      {isAttendanceWarning && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Attendance Warning: Minimum 75% Mandatory</p>
            <p className="mt-0.5 text-rose-700">
              Your overall attendance is currently {attendanceRate}%. Institutional policy requires at least 75% attendance to sit for final semester examinations.
            </p>
          </div>
        </div>
      )}

      {/* Enrolled Subjects & Recent Exam Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects list */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Current Enrolled Subjects</span>
            </h3>
            <button
              onClick={() => onNavigate('/student/attendance')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Detailed Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(stats?.enrolledSubjects ?? []).map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {sub.code}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{sub.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Semester {sub.semester} • {sub.credits} Academic Credits
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enrolled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Performance & Results preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Recent Examination Scores</span>
              </h3>
              <button
                onClick={() => onNavigate('/student/results')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Full Report Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats?.recentMarks && stats.recentMarks.length > 0 ? (
              <div className="space-y-3">
                {stats.recentMarks.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{m.subjectName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{m.subjectCode}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{m.marksObtained} / {m.totalMarks}</span>
                        <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          {m.grade}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{m.remarks || 'Passed'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No examination marks published yet for current term.</p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Official Standing: <span className="font-semibold text-slate-800">{stats?.academicStanding || 'Good Standing'}</span></span>
            <button
              onClick={() => onNavigate('/student/academic-records')}
              className="text-amber-600 font-bold hover:underline"
            >
              View Official Transcript
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
