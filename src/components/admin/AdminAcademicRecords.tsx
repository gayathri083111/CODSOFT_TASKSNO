import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Edit2,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../api.ts';
import { AcademicRecord } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';

export const AdminAcademicRecords: React.FC = () => {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null);
  const [formData, setFormData] = useState({
    semester: 1,
    gpa: 3.5,
    cgpa: 3.5,
    creditsCompleted: 30,
    totalCredits: 160,
    standing: 'Good Standing',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAcademicRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load academic records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (rec: AcademicRecord) => {
    setSelectedRecord(rec);
    setFormData({
      semester: rec.semester,
      gpa: rec.gpa,
      cgpa: rec.cgpa,
      creditsCompleted: rec.creditsCompleted,
      totalCredits: rec.totalCredits,
      standing: rec.standing,
      remarks: rec.remarks || '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      setSubmitting(true);
      await api.updateAcademicRecord(selectedRecord.id, formData);
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update academic record.');
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Records & Transcripts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain official grade point averages, credit completion benchmarks, and academic standing policies.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, standing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department / Program</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Semester GPA</th>
                <th className="py-3 px-4">Cumulative CGPA</th>
                <th className="py-3 px-4">Credits Progress</th>
                <th className="py-3 px-4">Academic Standing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading records...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No academic records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const isDeansList = rec.standing.includes("Dean's List");
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{rec.studentName}</div>
                        <div className="font-mono text-[11px] text-indigo-600">{rec.studentRoll}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{rec.departmentName}</div>
                        <div className="text-[11px] text-slate-500">{rec.courseName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        Semester {rec.semester}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {rec.gpa.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-700 text-sm">
                        {rec.cgpa.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{rec.creditsCompleted}</span>
                        <span className="text-slate-400"> / {rec.totalCredits}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isDeansList
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {rec.standing}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`btn-edit-academic-${rec.id}`}
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Update Standing / CGPA"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT RECORD MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Update Academic Standing: ${selectedRecord?.studentRoll}`} maxWidth="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester GPA (0.0 - 4.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credits Completed</label>
              <input
                type="number"
                value={formData.creditsCompleted}
                onChange={(e) => setFormData({ ...formData, creditsCompleted: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standing</label>
              <select
                value={formData.standing}
                onChange={(e) => setFormData({ ...formData, standing: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Dean's List / First Class">Dean's List / First Class</option>
                <option value="Good Standing">Good Standing</option>
                <option value="Academic Warning">Academic Warning</option>
                <option value="Academic Probation">Academic Probation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Excellent analytical performance"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
