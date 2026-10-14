import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  Clock,
  Info,
  Calendar
} from 'lucide-react';
import { remindersApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Notifications({ onRefreshReminders }) {
  const { addToast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const data = await remindersApi.getReminders();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await remindersApi.markAsRead(id);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_read: 1 } : r))
      );
      addToast('Marked notification as read', 'info');
      if (onRefreshReminders) onRefreshReminders();
    } catch (err) {
      addToast('Failed to update notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await remindersApi.markAllAsRead();
      setReminders((prev) => prev.map((r) => ({ ...r, is_read: 1 })));
      addToast('All notifications marked as read', 'success');
      if (onRefreshReminders) onRefreshReminders();
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'unread') return r.is_read === 0;
    return true;
  });

  const unreadCount = reminders.filter((r) => r.is_read === 0).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell size={24} className="text-indigo-600" />
            Notifications & Deadlines Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active deadline warnings, overdue assignments, and study alerts ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck size={15} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Scope / Notification Clarification Alert */}
      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
        <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">In-App Notification System Notice</p>
          <p className="text-blue-800/80 dark:text-blue-300/80 mt-0.5 leading-relaxed">
            These persistent reminders are dynamically checked against current deadlines whenever you use StudyTrack. To ensure student privacy and reliable local execution, notifications run in-app and do not send background push messages when your browser is closed.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All ({reminders.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Reminders List */}
      <div className="card rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading alerts...</div>
        ) : filteredReminders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            🎉 No notifications found. You are completely up to date!
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const isOverdue = rem.type === 'overdue';
            return (
              <div
                key={rem.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !rem.is_read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                    isOverdue
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  }`}>
                    {isOverdue ? <AlertCircle size={18} /> : <Clock size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {rem.title}
                      </h4>
                      {!rem.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {rem.message}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(rem.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {rem.task_subject && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
                          {rem.task_subject}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!rem.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(rem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
