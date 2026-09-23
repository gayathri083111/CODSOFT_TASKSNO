import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      id={id}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${
                  trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}
              </span>
              <span className="text-[11px] text-slate-400">vs last term</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
