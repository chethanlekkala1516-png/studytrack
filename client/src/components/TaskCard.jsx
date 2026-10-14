import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  const navigate = useNavigate();
  const isCompleted = task.status === 'Completed';

  // Priority color styles
  const priorityStyles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
  };

  // Format due date relative or human friendly
  const formatDeadline = (dueStr) => {
    if (!dueStr) return '';
    try {
      const d = new Date(dueStr);
      if (isNaN(d.getTime())) return dueStr;

      const now = new Date();
      const diffMs = d.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 3600));
      const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (diffHours < 0 && !isCompleted) {
        const absDays = Math.abs(diffDays);
        return `Overdue (${absDays === 0 ? 'earlier today' : `${absDays}d ago`})`;
      } else if (diffDays === 0) {
        return `Today at ${timeStr}`;
      } else if (diffDays === 1) {
        return `Tomorrow at ${timeStr}`;
      } else {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
      }
    } catch {
      return dueStr;
    }
  };

  const handleStartTimer = () => {
    navigate('/timer', { state: { selectedTaskId: task.id, taskTitle: task.title } });
  };

  return (
    <div
      className={`card p-4 transition-all duration-200 border rounded-xl bg-white dark:bg-slate-900 ${
        isCompleted
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-75'
          : task.is_overdue
          ? 'border-rose-300 dark:border-rose-800 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          onClick={() => onToggleStatus(task)}
          className="mt-1 flex-shrink-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isCompleted ? (
            <CheckCircle2 size={22} className="text-emerald-500 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950/40" />
          ) : (
            <Circle size={22} className="hover:scale-105 transition-transform" />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Subject Pill */}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              {task.subject}
            </span>

            {/* Priority Badge */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${priorityStyles[task.priority] || priorityStyles.Medium}`}>
              {task.priority}
            </span>

            {/* Status if In Progress */}
            {task.status === 'In Progress' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                In Progress
              </span>
            )}

            {/* Overdue Alert Tag */}
            {task.is_overdue && !isCompleted && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                <AlertCircle size={12} /> Overdue
              </span>
            )}
          </div>

          {/* Task Title */}
          <h4
            className={`text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 ${
              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Notes Preview */}
          {task.notes && (
            <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-slate-500 dark:text-slate-400 italic border border-slate-100 dark:border-slate-800/80">
              💡 {task.notes}
            </div>
          )}

          {/* Meta Info & Actions Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className={`flex items-center gap-1 font-medium ${
                task.is_overdue && !isCompleted ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''
              }`}>
                <Calendar size={13} />
                {formatDeadline(task.due_date)}
              </span>

              {task.estimated_duration && (
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {task.estimated_duration} mins
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {!isCompleted && (
                <button
                  onClick={handleStartTimer}
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1 text-[11px] font-medium"
                  title="Study this task in Focus Timer"
                >
                  <Play size={13} /> Focus
                </button>
              )}

              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Edit Task"
                aria-label="Edit Task"
              >
                <Edit2 size={14} />
              </button>

              <button
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Task"
                aria-label="Delete Task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
