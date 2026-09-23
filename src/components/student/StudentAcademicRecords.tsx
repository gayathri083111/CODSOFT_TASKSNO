import React, { useState, useEffect } from 'react';
import {
  Award,
  GraduationCap,
  Printer,
  CheckCircle2,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { api } from '../../api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { AcademicRecord } from '../../types.ts';

export const StudentAcademicRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAcademicRecords({ studentId: user?.studentId });
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load academic records:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const latestRecord = (records || [])[0];
  const cgpa = latestRecord ? latestRecord.cgpa : 3.82;
  const creditsEarned = latestRecord ? latestRecord.creditsCompleted : 64;
  const totalCredits = latestRecord ? latestRecord.totalCredits : 160;
  const completionPct = Math.round((creditsEarned / totalCredits) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Transcripts & Standing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official degree graduation progress, cumulative GPA metrics, and semester transcript logs.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Transcript</span>
        </button>
      </div>

      {/* Graduation Progress Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Cumulative CGPA</p>
            <p className="text-2xl font-black text-indigo-700 mt-0.5">{cgpa.toFixed(2)}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Scale of 4.00</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Credits Earned</span>
              <span className="font-bold text-slate-900">{creditsEarned} / {totalCredits}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionPct}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{completionPct}% towards degree completion</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Academic Standing</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{latestRecord?.standing || "Dean's List / First Class"}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Good Institutional Conduct</p>
          </div>
        </div>
      </div>

      {/* Transcript Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Semester Grade Transcript History</h3>
            <p className="text-xs text-slate-500">Student Roll: {user?.studentId} • Department of Computer Science</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Undergraduate Program
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Semester SGPA</th>
                <th className="py-3 px-4">Cumulative CGPA</th>
                <th className="py-3 px-4">Credits Completed</th>
                <th className="py-3 px-4">Academic Honor / Standing</th>
                <th className="py-3 px-4">Evaluation Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading academic transcript...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No transcript entries recorded</p>
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Semester {rec.semester}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {rec.courseName || 'B.Tech in Computer Science'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {rec.gpa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700 text-sm">
                      {rec.cgpa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {rec.creditsCompleted} Credits
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {rec.standing}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic">
                      {rec.remarks || 'Outstanding academic consistency'}
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
