import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Mail,
  Phone,
  BookOpen,
  Award,
  Calendar
} from 'lucide-react';
import { api } from '../../api.ts';
import { Teacher, Department } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';

export const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: 'Professor',
    specialization: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [tchRes, deptRes] = await Promise.all([
        api.getTeachers({
          search,
          departmentId: deptFilter || undefined,
        }),
        api.getDepartments(),
      ]);
      setTeachers(tchRes);
      setDepartments(deptRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load faculty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, deptFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      designation: 'Professor',
      specialization: '',
    });
    setError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    if (departments.length > 0) setFormData((prev) => ({ ...prev, departmentId: departments[0].id }));
    setIsAddOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      departmentId: teacher.departmentId,
      designation: teacher.designation,
      specialization: teacher.specialization || '',
    });
    setError(null);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.departmentId) {
      setError('Please provide teacher name, email, and department.');
      return;
    }
    try {
      setSubmitting(true);
      await api.createTeacher(formData);
      setIsAddOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    try {
      setSubmitting(true);
      await api.updateTeacher(selectedTeacher.id, formData);
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTeacher) return;
    try {
      setSubmitting(true);
      await api.deleteTeacher(selectedTeacher.id);
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty & Teacher Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain institutional academic faculty, designations, subject assignments, and credentials.
          </p>
        </div>
        <button
          id="btn-add-teacher"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-teachers"
            type="text"
            placeholder="Search by faculty name, designation, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <select
          id="filter-teacher-department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code} - {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teacher Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Faculty ID</th>
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Assigned Subjects</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading faculty...</p>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No faculty members found</p>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                      {teacher.teacherId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{teacher.name}</div>
                      <div className="text-[11px] text-slate-500">{teacher.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {teacher.departmentName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {teacher.designation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {teacher.specialization || 'General Studies'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((sub) => (
                            <span
                              key={sub.id}
                              className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-mono"
                            >
                              {sub.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No subjects assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`btn-view-teacher-${teacher.teacherId}`}
                          onClick={() => handleOpenDetail(teacher)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-edit-teacher-${teacher.teacherId}`}
                          onClick={() => handleOpenEdit(teacher)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit Teacher"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-teacher-${teacher.teacherId}`}
                          onClick={() => handleOpenDelete(teacher)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Teacher"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD TEACHER MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Appoint New Faculty Member" maxWidth="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Prof. David Miller"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="d.miller@edumanage.edu"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 444-3333"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Head of Department">Head of Department</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization / Domain Expertise</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Distributed Computing, VLSI Design, Robotics"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-add-teacher"
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Appointing...' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT TEACHER MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Faculty: ${selectedTeacher?.teacherId}`} maxWidth="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW TEACHER DETAILS MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Faculty Academic Portfolio" maxWidth="lg">
        {selectedTeacher && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
                {selectedTeacher.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedTeacher.name}</h3>
                <p className="font-mono text-emerald-800 font-semibold">{selectedTeacher.teacherId} • {selectedTeacher.designation}</p>
                <p className="text-slate-500">{selectedTeacher.email} • {selectedTeacher.phone}</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Assigned Instructional Subjects</span>
              </h4>
              {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {selectedTeacher.subjects.map((s) => (
                    <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{s.name}</span>
                        <span className="text-[11px] text-slate-400 block">Semester {s.semester} • {s.credits} Credits</span>
                      </div>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-sm text-slate-700">{s.code}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No assigned classes for this term.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE TEACHER MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Remove Faculty Member" maxWidth="sm">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to remove <span className="font-bold text-slate-900">{selectedTeacher?.name}</span> ({selectedTeacher?.teacherId})?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px]">
            This will deactivate their faculty login and disassociate their assigned subjects.
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delete-teacher"
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Removing...' : 'Remove Faculty'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
