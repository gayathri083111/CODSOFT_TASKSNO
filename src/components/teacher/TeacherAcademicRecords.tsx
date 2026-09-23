import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { api } from '../../api.ts';
import { AcademicRecord } from '../../types.ts';

export const TeacherAcademicRecords: React.FC = () => {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAcademicRecords();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load academic records:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = (records || []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(q) ||
      r.studentRoll?.toLowerCase().includes(q) ||
      r.standing?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Academic Standing & GPA</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor grade point averages, semester GPA progressions, and academic advising standing for your department.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, roll number, academic standing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department & Program</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Semester GPA</th>
                <th className="py-3 px-4">Cumulative CGPA</th>
                <th className="py-3 px-4">Credit Progress</th>
                <th className="py-3 px-4">Academic Standing</th>
                <th className="py-3 px-4">Instructor Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading academic records...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{rec.studentName}</div>
                      <div className="font-mono text-[11px] text-emerald-700">{rec.studentRoll}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{rec.courseName}</div>
                      <div className="text-[11px] text-slate-500">{rec.departmentName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Semester {rec.semester}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {rec.gpa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                      {rec.cgpa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{rec.creditsCompleted}</span>
                      <span className="text-slate-400"> / {rec.totalCredits}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {rec.standing}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic">
                      {rec.remarks || 'Regular progress'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
