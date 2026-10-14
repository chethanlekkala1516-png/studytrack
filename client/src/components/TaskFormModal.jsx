import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Literature',
  'Economics',
  'Psychology',
  'Engineering',
  'General'
];

export default function TaskFormModal({
  isOpen,
  task = null, // if provided, editing mode
  onClose,
  onSubmit,
  loading = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Computer Science',
    priority: 'Medium',
    status: 'Pending',
    start_date: '',
    due_date: '',
    estimated_duration: 45,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        subject: task.subject || 'Computer Science',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        start_date: task.start_date || '',
        due_date: task.due_date ? task.due_date.replace(' ', 'T') : '',
        estimated_duration: task.estimated_duration || 45,
        notes: task.notes || ''
      });
    } else {
      // Default to tomorrow 18:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      const defaultDue = `${yyyy}-${mm}-${dd}T18:00`;

      setFormData({
        title: '',
        description: '',
        subject: 'Computer Science',
        priority: 'Medium',
        status: 'Pending',
        start_date: `${yyyy}-${mm}-${dd}`,
        due_date: defaultDue,
        estimated_duration: 45,
        notes: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Format due_date cleanly
    const formattedData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject.trim(),
      due_date: formData.due_date.replace('T', ' '),
      notes: formData.notes.trim()
    };

    onSubmit(formattedData);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card max-w-xl w-full animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {task ? 'Edit Study Task' : 'Create New Study Task'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {task ? 'Update details, deadlines, and completion status.' : 'Schedule an assignment, lecture review, or exam prep.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Finish Calculus Problem Set 5"
              className={`input w-full ${errors.title ? 'border-rose-500 focus:ring-rose-500' : ''}`}
              autoFocus
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Subject & Priority Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Subject / Course *
              </label>
              <div className="relative">
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input w-full cursor-pointer appearance-none pr-8"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <BookOpen size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map((p) => {
                  const isSelected = formData.priority === p;
                  let colorClass = 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300';
                  if (isSelected) {
                    if (p === 'High') colorClass = 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-950/40 dark:border-rose-500 dark:text-rose-400 font-semibold';
                    else if (p === 'Medium') colorClass = 'bg-amber-50 border-amber-500 text-amber-600 dark:bg-amber-950/40 dark:border-amber-500 dark:text-amber-400 font-semibold';
                    else colorClass = 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-400 font-semibold';
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                      className={`text-xs py-2 px-3 border rounded-lg text-center transition-all ${colorClass}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Due Date & Duration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Due Date & Time *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className={`input w-full ${errors.due_date ? 'border-rose-500' : ''}`}
                />
              </div>
              {errors.due_date && <p className="text-xs text-rose-500 mt-1">{errors.due_date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Estimated Duration (Minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="estimated_duration"
                  min="5"
                  max="480"
                  step="5"
                  value={formData.estimated_duration}
                  onChange={handleChange}
                  className="input w-full"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">mins</span>
              </div>
            </div>
          </div>

          {/* Status (if editing) */}
          {task && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Pending', 'In Progress', 'Completed'].map((s) => {
                  const isSelected = formData.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, status: s }))}
                      className={`text-xs py-2 px-3 border rounded-lg text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-400 dark:text-indigo-300 font-semibold'
                          : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Key details, assignment criteria, or chapter numbers..."
              className="input w-full resize-none"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Study Notes / Resources
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Professor hints, page numbers, teammate contact..."
              className="input w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-5 py-2 text-sm flex items-center gap-2"
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
