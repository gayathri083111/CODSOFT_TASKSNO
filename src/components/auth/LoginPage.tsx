import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  UserCheck,
  ArrowLeft,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { Role } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface LoginPageProps {
  role: Role;
  onBack: () => void;
  onSuccess: (role: Role) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ role, onBack, onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleConfig: Record<Role, { title: string; subtitle: string; icon: any; color: string; defaultUser: string; defaultPass: string; badgeClass: string; buttonClass: string }> = {
    ADMIN: {
      title: 'Administrator Portal Login',
      subtitle: 'Sign in to access institutional administration and records',
      icon: ShieldCheck,
      color: 'indigo',
      defaultUser: 'admin',
      defaultPass: 'admin123',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    TEACHER: {
      title: 'Faculty / Teacher Login',
      subtitle: 'Sign in to manage classes, mark attendance, and submit marks',
      icon: GraduationCap,
      color: 'emerald',
      defaultUser: 'teacher',
      defaultPass: 'teacher123',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    STUDENT: {
      title: 'Student Scholar Login',
      subtitle: 'Sign in to review personal attendance, grades, and fee records',
      icon: UserCheck,
      color: 'amber',
      defaultUser: 'student',
      defaultPass: 'student123',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  const handleAutofill = () => {
    setUsername(config.defaultUser);
    setPassword(config.defaultPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password, role);
      onSuccess(role);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 py-12 selection:bg-indigo-100">
      <div className="w-full max-w-md">
        {/* Back link */}
        <button
          id="btn-back-to-roles"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 mb-3 text-slate-800">
              <Icon className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{config.title}</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">{config.subtitle}</p>

            <div className="mt-3">
              <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
                {role} AUTHORIZATION
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Fill Helper */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Demo User: </span>
                <code className="bg-white px-1.5 py-0.5 rounded-sm border text-slate-800 font-mono">{config.defaultUser}</code>
              </div>
              <button
                type="button"
                id="btn-autofill"
                onClick={handleAutofill}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-indigo-50/50 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Auto-fill
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="input-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`e.g. ${config.defaultUser} or ${config.defaultUser}@edumanage.edu`}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900 transition-shadow"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900 transition-shadow"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 cursor-not-allowed">Forgot password?</span>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 ${config.buttonClass} disabled:opacity-50`}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Sign In to {role} Portal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          EduManage Security System • Role Access Restricted
        </p>
      </div>
    </div>
  );
};
