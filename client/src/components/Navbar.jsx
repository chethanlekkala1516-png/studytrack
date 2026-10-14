import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Plus,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { remindersApi } from '../services/api';

export default function Navbar({
  onOpenMobileMenu,
  onOpenNewTask,
  unreadCount,
  onRefreshReminders
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickReminders, setQuickReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenNotifications = async () => {
    const nextState = !notificationOpen;
    setNotificationOpen(nextState);
    if (nextState) {
      setLoadingReminders(true);
      try {
        const data = await remindersApi.getReminders();
        setQuickReminders(data.reminders.slice(0, 5));
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoadingReminders(false);
      }
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await remindersApi.markAsRead(id);
      setQuickReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_read: 1 } : r))
      );
      if (onRefreshReminders) onRefreshReminders();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:block">
            <h2 className="text-sm md:text-base font-semibold text-slate-800 dark:text-white">
              Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.name ? user.name.split(' ')[0] : 'Student'}</span> 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Right: Quick actions, notifications, theme, profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Add Task Button */}
          <button
            onClick={onOpenNewTask}
            className="btn btn-primary px-3 md:px-4 py-2 text-xs md:text-sm flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleOpenNotifications}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-scale-up">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                  </span>
                  <Link
                    to="/notifications"
                    onClick={() => setNotificationOpen(false)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    View All
                  </Link>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loadingReminders ? (
                    <div className="p-6 text-center text-xs text-slate-400">Loading alerts...</div>
                  ) : quickReminders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      🎉 No new reminders! You are all caught up.
                    </div>
                  ) : (
                    quickReminders.map((rem) => (
                      <div
                        key={rem.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start gap-2.5 ${
                          !rem.is_read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {rem.type === 'overdue' ? (
                            <AlertCircle size={15} className="text-rose-500" />
                          ) : (
                            <CheckCircle2 size={15} className="text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {rem.title}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {rem.message}
                          </p>
                        </div>
                        {!rem.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(rem.id, e)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-scale-up py-1">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User size={15} /> Settings & Profile
                </Link>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
