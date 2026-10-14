import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  height = 'h-2.5',
  color = 'bg-indigo-600',
  showLabel = false,
  labelPrefix = '',
  className = ''
}) {
  const percentage = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <span>{labelPrefix}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
