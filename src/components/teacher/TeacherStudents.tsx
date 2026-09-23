import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  CalendarCheck2,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';
import { api } from '../../api.ts';
import { Student } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';

export const TeacherStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getStudents({ search });
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search]);

  const handleOpenDetail = async (s: Student) => {
    try {
      const details = await api.getStudentById(s.id);
      setSelectedStudent(details);
      setIsDetailOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load student details.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Students Roster</h1>
        <p className="text-xs text-slate-500 mt-1">
          Students enrolled in your lecture divisions, laboratory sections, and academic advising groups.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, roll number, department..."
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
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Program & Dept</th>
                <th className="py-3 px-4">Year / Sec</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Academic CGPA</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading students...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No students enrolled</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isLow = (student.attendanceRate || 100) < 75;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                        {student.studentId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-500">{student.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {student.courseName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        Year {student.year} • Sec {student.section}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {student.attendanceRate || 92}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {student.cgpa ? student.cgpa.toFixed(2) : '3.75'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Details Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Student Academic File" maxWidth="md">
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <h3 className="text-base font-bold text-slate-900">{selectedStudent.name}</h3>
              <p className="font-mono text-emerald-800 font-semibold">{selectedStudent.studentId}</p>
              <p className="text-slate-600 mt-1">{selectedStudent.courseName} • Year {selectedStudent.year}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendance %</span>
                <span className="text-lg font-bold text-emerald-600 mt-0.5 block">{selectedStudent.attendanceRate || 92}%</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cumulative CGPA</span>
                <span className="text-lg font-bold text-indigo-600 mt-0.5 block">
                  {selectedStudent.academicRecord?.cgpa || '3.80'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <p className="font-semibold text-slate-800">Contact & Guardian Info</p>
              <p className="text-slate-600">Email: {selectedStudent.email}</p>
              <p className="text-slate-600">Phone: {selectedStudent.phone || 'Not recorded'}</p>
              <p className="text-slate-600">Guardian: {selectedStudent.guardianName || 'Parent'} ({selectedStudent.guardianPhone || 'N/A'})</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
