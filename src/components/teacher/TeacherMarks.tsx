import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api.ts';
import { Examination, Subject, Student } from '../../types.ts';

export const TeacherMarks: React.FC = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [marksMap, setMarksMap] = useState<Record<string, { marksObtained: number; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [exRes, subRes, stuRes] = await Promise.all([
          api.getExaminations(),
          api.getSubjects(),
          api.getStudents(),
        ]);
        const safeEx = Array.isArray(exRes) ? exRes : [];
        const safeSub = Array.isArray(subRes) ? subRes : [];
        const safeStu = Array.isArray(stuRes) ? stuRes : [];
        setExaminations(safeEx);
        setSubjects(safeSub);
        setStudents(safeStu);

        if (safeEx.length > 0) setSelectedExamId(safeEx[0].id);
        if (safeSub.length > 0) setSelectedSubjectId(safeSub[0].id);

        // Pre-fill initial marks
        const map: Record<string, { marksObtained: number; remarks: string }> = {};
        safeStu.forEach((s, idx) => {
          map[s.id] = { marksObtained: 85 - (idx % 4) * 5, remarks: 'Good analytical reasoning' };
        });
        setMarksMap(map);
      } catch (err) {
        console.error('Failed to load marks workspace:', err);
        setExaminations([]);
        setSubjects([]);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // When exam or subject changes, load existing marks if any
  useEffect(() => {
    if (!selectedExamId || !selectedSubjectId) return;
    async function loadExistingMarks() {
      try {
        const existing = await api.getMarks({
          examinationId: selectedExamId,
          subjectId: selectedSubjectId,
        });
        const safeExisting = Array.isArray(existing) ? existing : [];
        if (safeExisting.length > 0) {
          const map: Record<string, { marksObtained: number; remarks: string }> = {};
          safeExisting.forEach((m) => {
            map[m.studentId] = { marksObtained: m.marksObtained, remarks: m.remarks || '' };
          });
          setMarksMap((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.warn('Could not query existing marks:', err);
      }
    }
    loadExistingMarks();
  }, [selectedExamId, selectedSubjectId]);

  const selectedExam = examinations.find((e) => e.id === selectedExamId);
  const totalMarks = selectedExam?.totalMarks || 100;
  const passMarks = selectedExam?.passingMarks || 40;

  const calculateGrade = (score: number) => {
    const pct = (score / totalMarks) * 100;
    if (pct >= 90) return { grade: 'A+', color: 'text-emerald-700 bg-emerald-50' };
    if (pct >= 80) return { grade: 'A', color: 'text-emerald-700 bg-emerald-50' };
    if (pct >= 70) return { grade: 'B', color: 'text-blue-700 bg-blue-50' };
    if (pct >= 60) return { grade: 'C', color: 'text-indigo-700 bg-indigo-50' };
    if (pct >= 50) return { grade: 'D', color: 'text-amber-700 bg-amber-50' };
    return { grade: 'F', color: 'text-rose-700 bg-rose-50' };
  };

  const handleScoreChange = (studentId: string, value: number) => {
    const val = Math.max(0, Math.min(totalMarks, value || 0));
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: val,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !selectedSubjectId) {
      alert('Please choose an examination and subject.');
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMsg(null);

      const entries = students.map((s) => {
        const score = marksMap[s.id]?.marksObtained ?? 75;
        const gradeInfo = calculateGrade(score);
        return {
          examinationId: selectedExamId,
          subjectId: selectedSubjectId,
          studentId: s.id,
          marksObtained: score,
          totalMarks,
          grade: gradeInfo.grade,
          remarks: marksMap[s.id]?.remarks || '',
        };
      });

      const res = await api.saveMarksBatch(entries);
      setSuccessMsg(`Successfully saved and published examination marks for ${res.count} students!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to save marks.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examination Marks Evaluation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter raw assessment scores, automate letter grading, and publish performance records for student transcripts.
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Selectors */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Target Examination</label>
          <select
            id="select-marks-exam"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.code}) • Sem {ex.semester}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Instruction Subject</label>
          <select
            id="select-marks-subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name} (Credits: {sub.credits})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Marks Obtained (Max: {totalMarks})</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Calculated Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Faculty Evaluation Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading marks matrix...</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const score = marksMap[student.id]?.marksObtained ?? 80;
                  const pct = Math.round((score / totalMarks) * 100);
                  const isPassed = score >= passMarks;
                  const gradeData = calculateGrade(score);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                        {student.studentId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={totalMarks}
                            value={score}
                            onChange={(e) => handleScoreChange(student.id, Number(e.target.value))}
                            className="w-20 px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                          <span className="text-slate-400 font-medium">/ {totalMarks}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {pct}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded-md text-xs border ${gradeData.color}`}>
                          {gradeData.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Excellent presentation"
                          value={marksMap[student.id]?.remarks || ''}
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

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Passing criteria: Minimum {passMarks} / {totalMarks} marks ({Math.round((passMarks/totalMarks)*100)}%)
          </span>
          <button
            id="btn-save-marks"
            type="button"
            onClick={handleSaveMarks}
            disabled={submitting || loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Marks...' : 'Save & Publish Marks'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
