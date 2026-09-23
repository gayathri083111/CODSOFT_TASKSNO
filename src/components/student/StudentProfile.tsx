import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Heart,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { api } from '../../api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Student } from '../../types.ts';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getStudentById(user?.studentId || 'stu-1');
        setStudent(data);
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="inline-block w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-xs">Loading profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        Student profile record could not be located.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Student Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Official enrollment records, academic registration details, and guardian information on file.
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <p className="font-mono text-xs font-bold text-indigo-700 mt-0.5">Roll ID: {student.studentId}</p>
            </div>
            <span className="self-center sm:self-start px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              {student.status} ENROLLMENT
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {student.courseName} • Department of {student.departmentName}
          </p>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Academic Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Academic Registration</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold text-slate-800">{student.departmentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Degree Program:</span>
              <span className="font-semibold text-slate-800">{student.courseName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Current Academic Year:</span>
              <span className="font-semibold text-slate-800">Year {student.year} (Class of {new Date().getFullYear() + 4 - student.year})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Section Division:</span>
              <span className="font-semibold text-slate-800">Section {student.section}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Enrollment Date:</span>
              <span className="font-semibold text-slate-800">{student.enrollmentDate}</span>
            </div>
          </div>
        </div>

        {/* Personal & Contact Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Personal & Contact Information</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Email Address:</span>
              <span className="font-semibold text-slate-800">{student.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Contact Number:</span>
              <span className="font-semibold text-slate-800">{student.phone || 'Not Registered'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Date of Birth:</span>
              <span className="font-semibold text-slate-800">{student.dateOfBirth || '2004-05-12'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Blood Group:</span>
              <span className="font-mono font-bold text-rose-600">{student.bloodGroup || 'O+'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Residential Address:</span>
              <span className="font-semibold text-slate-800">{student.address || 'Campus Dormitory'}</span>
            </div>
          </div>
        </div>

        {/* Guardian / Emergency Contact */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Parent / Legal Guardian & Emergency Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Guardian Name:</span>
              <span className="font-bold text-slate-800 text-sm">{student.guardianName || 'Carlos Rivera'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Guardian Phone Number:</span>
              <span className="font-bold text-slate-800 text-sm">{student.guardianPhone || '+1 (555) 345-6789'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
