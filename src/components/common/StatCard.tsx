import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  trend?: {
    label: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subvalue,
  icon: Icon,
  iconColor = 'text-[#0F5132]',
  bgColor = 'bg-emerald-50/70',
  trend,
  onClick,
  accent = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 border relative overflow-hidden ${
        accent
          ? 'bg-gradient-to-br from-[#0F5132] to-[#0A3622] text-white border-[#0F5132] shadow-sm'
          : 'bg-white text-gray-800 border-gray-200/80 hover:border-gray-300 hover:shadow-xs'
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs font-semibold tracking-wide uppercase ${
              accent ? 'text-emerald-200' : 'text-gray-500'
            }`}
          >
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <h4
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                accent ? 'text-white' : 'text-gray-900'
              }`}
            >
              {value}
            </h4>
          </div>
          {subvalue && (
            <p
              className={`text-xs mt-1 font-medium ${
                accent ? 'text-emerald-100' : 'text-gray-500'
              }`}
            >
              {subvalue}
            </p>
          )}
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            accent ? 'bg-white/10 text-[#FEF9E7]' : `${bgColor} ${iconColor}`
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-gray-100/10 flex items-center gap-1.5 text-[11px] font-semibold">
          <span
            className={
              accent
                ? 'text-[#D4AF37]'
                : trend.isPositive
                ? 'text-emerald-600'
                : 'text-rose-600'
            }
          >
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};
