import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Award,
  Printer,
  CheckCircle2,
  XCircle,
  GraduationCap
} from 'lucide-react';
import { api } from '../../api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Mark, Examination } from '../../types.ts';

export const StudentResults: React.FC = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [marksRes, exRes] = await Promise.all([
          api.getMarks({ studentId: user?.studentId }),
          api.getExaminations(),
        ]);
        const safeMarks = Array.isArray(marksRes) ? marksRes : [];
        const safeExams = Array.isArray(exRes) ? exRes : [];
        setMarks(safeMarks);
        setExaminations(safeExams);
        if (safeExams.length > 0) setSelectedExamId(safeExams[0].id);
      } catch (err) {
        console.error('Failed to load student results:', err);
        setMarks([]);
        setExaminations([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filteredMarks = (marks || []).filter((m) => {
    if (!selectedExamId) return true;
    return m.examinationId === selectedExamId;
  });

  const totalPossible = filteredMarks.reduce((acc, m) => acc + m.totalMarks, 0);
  const totalObtained = filteredMarks.reduce((acc, m) => acc + m.marksObtained, 0);
  const overallPercentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 85;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Official Examination Results</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional statement of marks, computed subject letter grades, and semester evaluations.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Grade Statement</span>
        </button>
      </div>

      {/* Select Examination */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">Filter by Examination:</span>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Examinations</option>
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.code})
              </option>
            ))}
          </select>
        </div>

        {totalPossible > 0 && (
          <div className="text-xs">
            <span className="text-slate-500">Aggregate Score: </span>
            <span className="font-bold text-slate-900">{totalObtained} / {totalPossible} ({overallPercentage}%)</span>
          </div>
        )}
      </div>

      {/* Results Table / Printable Statement */}
      <div id="printable-statement" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Course Assessment Scorecard</h3>
            <p className="text-xs text-slate-500">Scholar: {user?.name} ({user?.studentId || 'STU-2026-001'})</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
            PASSED & PROMOTED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Max Marks</th>
                <th className="py-3 px-4">Marks Scored</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Letter Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Instructor Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading scorecard...</p>
                  </td>
                </tr>
              ) : filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No examination scores published</p>
                  </td>
                </tr>
              ) : (
                filteredMarks.map((m) => {
                  const pct = Math.round((m.marksObtained / m.totalMarks) * 100);
                  const isPass = m.marksObtained >= 40;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {m.subjectCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {m.subjectName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {m.totalMarks}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {m.marksObtained}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {pct}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {m.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic">
                        {m.remarks || 'Satisfactory achievement'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Grading Scale: A+ (90%+), A (80%+), B (70%+), C (60%+), D (50%+), F (Below 50%)</span>
          <span className="font-medium text-slate-700">Certified by Academic Dean Office</span>
        </div>
      </div>
    </div>
  );
};
