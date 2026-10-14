import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className="modal-card max-w-md w-full animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isDanger ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-base">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 text-sm text-slate-600 dark:text-slate-300">
          {message}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary px-4 py-2 text-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn px-4 py-2 text-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
