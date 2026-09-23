import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  Calendar
} from 'lucide-react';
import { api } from '../../api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { AttendanceRecord, AttendanceStatus, Subject } from '../../types.ts';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [attRes, subRes] = await Promise.all([
          api.getAttendance({ studentId: user?.studentId }),
          api.getSubjects(),
        ]);
        setRecords(Array.isArray(attRes) ? attRes : []);
        setSubjects(Array.isArray(subRes) ? subRes : []);
      } catch (err) {
        console.error('Failed to load student attendance:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const totalClasses = (records || []).length;
  const presentCount = (records || []).filter((r) => r.status === 'PRESENT').length;
  const absentCount = (records || []).filter((r) => r.status === 'ABSENT').length;
  const lateCount = (records || []).filter((r) => r.status === 'LATE').length;
  const overallRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 92;
  const isWarning = overallRate < 75;

  const filtered = (records || []).filter((r) => {
    if (!subjectFilter) return true;
    return r.subjectId === subjectFilter;
  });

  const statusBadges: Record<AttendanceStatus, { label: string; class: string; icon: any }> = {
    PRESENT: { label: 'Present', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    ABSENT: { label: 'Absent', class: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
    LATE: { label: 'Late', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    EXCUSED: { label: 'Excused', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertTriangle },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lecture Attendance Tracker</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your mandatory lecture presence, individual subject thresholds, and session audit history.
        </p>
      </div>

      {/* Attendance Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isWarning ? 'text-rose-500' : 'text-emerald-500'}
                strokeDasharray={`${overallRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-xl font-black ${isWarning ? 'text-rose-600' : 'text-emerald-600'}`}>
                {overallRate}%
              </span>
              <span className="text-[9px] font-bold uppercase text-slate-400">Total</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Semester Attendance Compliance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Minimum mandatory threshold: <span className="font-bold text-slate-800">75%</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isWarning
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {isWarning ? 'De-barment Warning Active' : 'Examination Eligible'}
              </span>
            </div>
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400">Attended</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{presentCount}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400">Absences</p>
            <p className="text-lg font-bold text-rose-600 mt-0.5">{absentCount}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400">Late</p>
            <p className="text-lg font-bold text-amber-600 mt-0.5">{lateCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Attendance Log Sessions</span>
          </h3>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Instructor Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading attendance history...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <CalendarCheck2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No attendance entries recorded</p>
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const badge = statusBadges[rec.status];
                  const Icon = badge.icon;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {rec.date}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {rec.subjectName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-700 font-bold">
                        {rec.subjectCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.class}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic">
                        {rec.remarks || 'Regular class session'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
