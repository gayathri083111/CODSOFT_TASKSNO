import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Sparkles,
  BookOpen,
  Calendar
} from 'lucide-react';
import { api } from '../../api.ts';
import { Student, Subject, AttendanceStatus } from '../../types.ts';

export const TeacherAttendance: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [subs, stus] = await Promise.all([
          api.getSubjects(),
          api.getStudents(),
        ]);
        const safeSubs = Array.isArray(subs) ? subs : [];
        const safeStus = Array.isArray(stus) ? stus : [];
        setSubjects(safeSubs);
        if (safeSubs.length > 0) {
          setSelectedSubjectId(safeSubs[0].id);
        }
        setStudents(safeStus);

        // Initialize default map as all PRESENT
        const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
        safeStus.forEach((s) => {
          initialMap[s.id] = { status: 'PRESENT', remarks: '' };
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        console.error('Error loading attendance workspace:', err);
        setSubjects([]);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status: 'PRESENT', remarks: '' };
    });
    setAttendanceMap(updated);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedSubjectId) {
      alert('Please select a subject.');
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMsg(null);

      const records = students.map((s) => ({
        studentId: s.id,
        subjectId: selectedSubjectId,
        date,
        status: attendanceMap[s.id]?.status || 'PRESENT',
        remarks: attendanceMap[s.id]?.remarks || '',
      }));

      const res = await api.markAttendanceBatch(records);
      setSuccessMsg(`Successfully saved attendance for ${res.count} students on ${date}!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Record Daily Class Attendance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct roll call, record scholar presence, and synchronize with student portal attendance transcripts.
          </p>
        </div>

        <button
          id="btn-mark-all-present"
          type="button"
          onClick={handleMarkAllPresent}
          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Set All as Present</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Control Bar: Select Subject and Date */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Select Lecture Subject</label>
          <div className="relative">
            <select
              id="select-attendance-subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Class Date</label>
          <input
            id="input-attendance-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
          <div className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600">
            <span className="font-semibold text-slate-800">{students.length}</span> students in lecture roster
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Year & Sec</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Optional Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading class roster...</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{student.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        Year {student.year} • Sec {student.section}
                      </td>
                      <td className="py-3 px-4">
                        {/* Status Toggle Pills */}
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Approved medical leave"
                          value={attendanceMap[student.id]?.remarks || ''}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          className="w-full max-w-xs px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Submit Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Records will be logged under faculty credential: {selectedSubject?.code} on {date}
          </span>
          <button
            id="btn-submit-attendance"
            type="button"
            onClick={handleSubmitAttendance}
            disabled={submitting || loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Saving Roll Call...' : 'Submit Lecture Attendance'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
