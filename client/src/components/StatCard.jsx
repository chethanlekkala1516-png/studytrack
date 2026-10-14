import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  badgeText,
  onClick
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-200 dark:hover:border-indigo-800'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-200 dark:hover:border-emerald-800'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-200 dark:hover:border-amber-800'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-200 dark:hover:border-rose-800'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-200 dark:hover:border-blue-800'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-200 dark:hover:border-purple-800'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`card p-5 transition-all duration-200 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.bg} ${scheme.text}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
        {badgeText && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scheme.bg} ${scheme.text}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
