import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  colorClass?: string;
  subtitle?: string;
  pendingValue?: number;
  trend?: { value: number; label: string };
}

// Map colorClass → accessible CSS custom-property icon color
const colorMap: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  'bg-primary': { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500', border: 'border-indigo-100' },
  'bg-indigo-900': { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500', border: 'border-slate-200' },
  'bg-slate-500': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
  'bg-blue-600': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', border: 'border-blue-100' },
  'bg-emerald-600': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100' },
  'bg-rose-500': { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', border: 'border-rose-100' },
  'bg-indigo-700': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-600', border: 'border-indigo-100' },
};

const getColors = (colorClass: string) =>
  colorMap[colorClass] ?? { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-100' };

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  colorClass = 'bg-primary',
  subtitle,
  trend,
}) => {
  const colors = getColors(colorClass);

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="stat-card-label">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="stat-card-value">{value.toLocaleString()}</p>
            {trend && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend.value >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
            {icon}
          </div>
        )}
      </div>

      {!trend && (
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} aria-hidden="true" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live Status</span>
          </div>
          <div className="w-12 h-1 bg-gray-50 rounded-full overflow-hidden">
             <div className={`h-full ${colors.dot} opacity-20 w-2/3`}></div>
          </div>
        </div>
      )}
      
      {trend && (
        <div className="mt-5 pt-4 border-t border-gray-100">
           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
