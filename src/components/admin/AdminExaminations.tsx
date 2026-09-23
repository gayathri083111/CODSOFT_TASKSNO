import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api.ts';
import { Examination, Subject } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';

export const AdminExaminations: React.FC = () => {
  const [exams, setExams] = useState<Examination[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Add exam modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'MID_TERM' as any,
    semester: 1,
    startDate: '',
    endDate: '',
    totalMarks: 100,
    passingMarks: 40,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [exRes, subRes] = await Promise.all([
        api.getExaminations(),
        api.getSubjects(),
      ]);
      setExams(Array.isArray(exRes) ? exRes : []);
      setSubjects(Array.isArray(subRes) ? subRes : []);
    } catch (err: any) {
      console.error('Failed to load examinations:', err);
      setExams([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      code: `EXAM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      type: 'MID_TERM',
      semester: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      totalMarks: 100,
      passingMarks: 40,
    });
    setError(null);
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Exam name and code are required.');
      return;
    }
    try {
      setSubmitting(true);
      await api.createExamination(formData);
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create exam.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examinations & Assessment Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure examination schedules, grading policies, and institutional evaluation terms.
          </p>
        </div>
        <button
          id="btn-schedule-exam"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Examination</span>
        </button>
      </div>

      {/* Examinations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400">
            <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-xs">Loading examinations...</p>
          </div>
        ) : exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  {exam.code}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {exam.type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{exam.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Semester {exam.semester} Institutional Assessment</p>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{exam.startDate} to {exam.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span>Max: {exam.totalMarks} / Pass: {exam.passingMarks}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Examination Term</span>
              </span>
              <span className="text-slate-400">Total Marks: {exam.totalMarks}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Curriculum Subjects Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Curriculum Subjects Catalog</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Subject Code</th>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3">Credits</th>
                <th className="py-2.5 px-3">Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{sub.code}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{sub.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{sub.credits} Credits</td>
                  <td className="py-2.5 px-3 text-slate-600">Semester {sub.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXAM MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Examination" maxWidth="md">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. End Semester Theory Examination 2026"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="MID_TERM">Mid-Term</option>
                <option value="FINAL">Final Semester</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="PRACTICAL">Practical Lab</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Marks</label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
