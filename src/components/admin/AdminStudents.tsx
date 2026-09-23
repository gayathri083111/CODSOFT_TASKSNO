import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  FileText
} from 'lucide-react';
import { api } from '../../api.ts';
import { Student, Department, Course, StudentStatus } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailedStudent, setDetailedStudent] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    courseId: '',
    year: 1,
    section: 'A',
    dateOfBirth: '',
    address: '',
    guardianName: '',
    guardianPhone: '',
    bloodGroup: '',
    status: 'ACTIVE' as StudentStatus,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [stuRes, deptRes, crsRes] = await Promise.all([
        api.getStudents({
          search,
          departmentId: deptFilter || undefined,
          year: yearFilter ? Number(yearFilter) : undefined,
          status: statusFilter || undefined,
        }),
        api.getDepartments(),
        api.getCourses(),
      ]);
      setStudents(stuRes);
      setDepartments(deptRes);
      setCourses(crsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, deptFilter, yearFilter, statusFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      courseId: courses[0]?.id || '',
      year: 1,
      section: 'A',
      dateOfBirth: '',
      address: '',
      guardianName: '',
      guardianPhone: '',
      bloodGroup: 'O+',
      status: 'ACTIVE',
    });
    setError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    if (departments.length > 0) setFormData((prev) => ({ ...prev, departmentId: departments[0].id }));
    if (courses.length > 0) setFormData((prev) => ({ ...prev, courseId: courses[0].id }));
    setIsAddOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      departmentId: student.departmentId,
      courseId: student.courseId,
      year: student.year,
      section: student.section,
      dateOfBirth: student.dateOfBirth || '',
      address: student.address || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      bloodGroup: student.bloodGroup || 'O+',
      status: student.status,
    });
    setError(null);
    setIsEditOpen(true);
  };

  const handleOpenDetail = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const details = await api.getStudentById(student.id);
      setDetailedStudent(details);
      setIsDetailOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load full student details.');
    }
  };

  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.departmentId || !formData.courseId) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    // Basic email check
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createStudent(formData);
      setIsAddOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      setSubmitting(true);
      await api.updateStudent(selectedStudent.id, formData);
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedStudent) return;
    try {
      setSubmitting(true);
      await api.deleteStudent(selectedStudent.id);
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory & Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register, search, update, and manage student enrollments and records.
          </p>
        </div>
        <button
          id="btn-add-student"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-students"
            type="text"
            placeholder="Search by student name, roll number, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="filter-department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          <select
            id="filter-year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="GRADUATED">Graduated</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Name & Contact</th>
                <th className="py-3 px-4">Dept & Course</th>
                <th className="py-3 px-4">Year / Sec</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Fee Dues</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading students...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No students found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try refining your search or filter parameters.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isLowAttendance = (student.attendanceRate || 100) < 75;
                  const hasPendingFee = (student.pendingFeeAmount || 0) > 0;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700">
                        {student.studentId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-500">{student.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{student.departmentName}</div>
                        <div className="text-[11px] text-slate-500">{student.courseName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700">Year {student.year}</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-slate-500">Sec {student.section}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isLowAttendance ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {student.attendanceRate || 92}%
                          </span>
                          {isLowAttendance && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded-sm border border-rose-200">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {hasPendingFee ? (
                          <span className="font-semibold text-amber-600">${student.pendingFeeAmount?.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Cleared</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            student.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            id={`btn-view-${student.studentId}`}
                            onClick={() => handleOpenDetail(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-edit-${student.studentId}`}
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-${student.studentId}`}
                            onClick={() => handleOpenDelete(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student" maxWidth="xl">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. eleanor.v@edumanage.edu"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Program / Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  placeholder="A"
                  maxLength={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full Street address, City, State"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian / Parent Name</label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Parent/Guardian Full Name"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Contact Phone</label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+1 (555) 999-8888"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
              id="btn-confirm-add-student"
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Student: ${selectedStudent?.studentId}`} maxWidth="xl">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enrollment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="GRADUATED">GRADUATED</option>
              </select>
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
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* STUDENT PROFILE DETAILS MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Student Academic Profile" maxWidth="2xl">
        {detailedStudent && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header info */}
            <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  {detailedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{detailedStudent.name}</h3>
                  <p className="font-mono text-indigo-700 font-semibold">{detailedStudent.studentId}</p>
                  <p className="text-slate-500 text-[11px]">{detailedStudent.email} • {detailedStudent.phone}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {detailedStudent.status}
              </span>
            </div>

            {/* Academic & Attendance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Current CGPA</p>
                <p className="text-lg font-bold text-indigo-600 mt-0.5">
                  {detailedStudent.academicRecord?.cgpa || detailedStudent.cgpa || '3.80'}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">
                  {detailedStudent.attendanceRate || 92.5}%
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Completed Credits</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {detailedStudent.academicRecord?.creditsCompleted || 94} / 160
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Academic Standing</p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {detailedStudent.academicRecord?.standing || 'Good Standing'}
                </p>
              </div>
            </div>

            {/* Enrolled Program */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Program Enrollment</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Department:</span>
                  <span className="font-semibold text-slate-800">{detailedStudent.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Degree:</span>
                  <span className="font-semibold text-slate-800">{detailedStudent.courseName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Year & Section:</span>
                  <span className="font-semibold text-slate-800">Year {detailedStudent.year}, Section {detailedStudent.section}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Address:</span>
                  <span className="font-semibold text-slate-800">{detailedStudent.address || 'Campus Residence'}</span>
                </div>
              </div>
            </div>

            {/* Fees summary */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 mb-2">Fee Ledger Status</h4>
              {detailedStudent.fees?.length > 0 ? (
                <div className="space-y-1.5">
                  {detailedStudent.fees.map((f: any) => (
                    <div key={f.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-800">{f.feeType}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">${f.amount}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">No fee dues recorded.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Student Deletion" maxWidth="sm">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to remove student <span className="font-bold text-slate-900">{selectedStudent?.name}</span> ({selectedStudent?.studentId})?
          </p>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
            This action will remove the student user account, associated attendance logs, examination marks, and fee records.
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delete-student"
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Student'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
