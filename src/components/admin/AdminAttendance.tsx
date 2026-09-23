import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../api.ts';
import { AttendanceRecord, AttendanceStatus, Course, Subject } from '../../types.ts';

export const AdminAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [attRes, crsRes, subRes] = await Promise.all([
        api.getAttendance({
          date: dateFilter || undefined,
          courseId: courseFilter || undefined,
          subjectId: subjectFilter || undefined,
          status: statusFilter || undefined,
        }),
        api.getCourses(),
        api.getSubjects(),
      ]);
      setAttendance(Array.isArray(attRes) ? attRes : []);
      setCourses(Array.isArray(crsRes) ? crsRes : []);
      setSubjects(Array.isArray(subRes) ? subRes : []);
    } catch (err: any) {
      console.error('Failed to load attendance:', err);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFilter, courseFilter, subjectFilter, statusFilter]);

  const total = (attendance || []).length;
  const presentCount = (attendance || []).filter((a) => a.status === 'PRESENT').length;
  const absentCount = (attendance || []).filter((a) => a.status === 'ABSENT').length;
  const lateCount = (attendance || []).filter((a) => a.status === 'LATE').length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

  const statusBadges: Record<AttendanceStatus, { label: string; class: string; icon: any }> = {
    PRESENT: { label: 'Present', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    ABSENT: { label: 'Absent', class: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
    LATE: { label: 'Late', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    EXCUSED: { label: 'Excused', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertTriangle },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Attendance Audit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Examine lecture attendance logs, faculty submissions, and individual scholar presence.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Filtered Records</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{total} Sessions</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase">Overall Attendance</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{rate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase">Total Absences</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{absentCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase">Late Arrivals</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{lateCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="EXCUSED">Excused</option>
          </select>
        </div>

        {(dateFilter || courseFilter || subjectFilter || statusFilter) && (
          <button
            onClick={() => {
              setDateFilter('');
              setCourseFilter('');
              setSubjectFilter('');
              setStatusFilter('');
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading attendance records...</p>
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <CalendarCheck2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No attendance entries match query</p>
                  </td>
                </tr>
              ) : (
                attendance.map((rec) => {
                  const badge = statusBadges[rec.status];
                  const Icon = badge.icon;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{rec.studentName}</div>
                        <div className="font-mono text-[11px] text-indigo-600">{rec.studentId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{rec.subjectName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{rec.subjectCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.class}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {rec.markedByName || 'Academic Staff'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic">
                        {rec.remarks || '—'}
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
