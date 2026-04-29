'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPITileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;        // positive = up, negative = down, 0 = flat
  trendLabel?: string;
  icon: React.ReactNode;
  accentColor?: string;  // tailwind class e.g. 'text-emerald-600'
}

export function KPITile({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  accentColor = 'text-primary',
}: KPITileProps) {
  const trendColor =
    trend !== undefined
      ? trend > 0
        ? 'text-emerald-600'
        : trend < 0
          ? 'text-red-500'
          : 'text-slate-400'
      : undefined;

  const TrendIcon =
    trend !== undefined
      ? trend > 0
        ? TrendingUp
        : trend < 0
          ? TrendingDown
          : Minus
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
            {title}
          </p>
          <p className={`mt-2 text-xl font-bold ${accentColor} font-display tracking-tight`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-3 p-2 rounded-xl bg-slate-50 border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
          <span className={accentColor}>{icon}</span>
        </div>
      </div>

      {trend !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-bold ${trendColor}`}>
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {TrendIcon && <TrendIcon className="h-3 w-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
          {trendLabel && (
            <span className="text-slate-400 font-medium ml-1 truncate">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
