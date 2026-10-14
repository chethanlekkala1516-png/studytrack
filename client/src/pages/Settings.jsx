import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Target,
  Clock,
  Palette,
  Globe,
  Save,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { settingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { user, refreshUser, logout, updateUserSettings } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Daily Targets
  const [dailyTaskGoal, setDailyTaskGoal] = useState(5);
  const [dailyStudyMinutesGoal, setDailyStudyMinutesGoal] = useState(120);

  // Timer Preferences
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);

  // System & Localization
  const [timezone, setTimezone] = useState('UTC');
  const [reminderLeadTime, setReminderLeadTime] = useState(60);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsApi.getSettings();
        if (data.user) {
          setName(data.user.name || '');
          setEmail(data.user.email || '');
        }
        if (data.settings) {
          setDailyTaskGoal(data.settings.daily_task_goal || 5);
          setDailyStudyMinutesGoal(data.settings.daily_study_minutes_goal || 120);
          setFocusDuration(data.settings.focus_duration || 25);
          setShortBreak(data.settings.short_break || 5);
          setLongBreak(data.settings.long_break || 15);
          setTimezone(data.settings.timezone || 'UTC');
          setReminderLeadTime(data.settings.reminder_lead_time || 60);
          if (data.settings.theme) {
            setTheme(data.settings.theme);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name,
        theme,
        daily_task_goal: parseInt(dailyTaskGoal, 10),
        daily_study_minutes_goal: parseInt(dailyStudyMinutesGoal, 10),
        focus_duration: parseInt(focusDuration, 10),
        short_break: parseInt(shortBreak, 10),
        long_break: parseInt(longBreak, 10),
        timezone,
        reminder_lead_time: parseInt(reminderLeadTime, 10)
      };

      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (!currentPassword) {
          throw new Error('Current password is required to update password');
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await settingsApi.updateSettings(payload);
      updateUserSettings(res.settings);
      await refreshUser();

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      addToast('Settings & preferences saved successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <SettingsIcon size={24} className="text-indigo-600" />
            Student Account & Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure profile, study targets, focus timer intervals, and UI appearance
          </p>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 px-3.5 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <div className="card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            Student Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Registered Email (ID)
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="input w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-70"
              />
            </div>
          </div>
        </div>

        {/* Daily Goals & Targets Card */}
        <div className="card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Target size={18} className="text-emerald-600" />
            Daily Productivity Goals
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Daily Completed Tasks Target
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={dailyTaskGoal}
                onChange={(e) => setDailyTaskGoal(e.target.value)}
                className="input w-full"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Number of completed tasks required each day to maintain your streak.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Daily Study Time Target (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="720"
                step="10"
                value={dailyStudyMinutesGoal}
                onChange={(e) => setDailyStudyMinutesGoal(e.target.value)}
                className="input w-full"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Focus timer study minutes counted toward your streak daily.
              </span>
            </div>
          </div>
        </div>

        {/* Focus Timer Durations Card */}
        <div className="card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-600" />
            Default Timer Intervals (Minutes)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Focus Session
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={focusDuration}
                onChange={(e) => setFocusDuration(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Short Break
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreak}
                onChange={(e) => setShortBreak(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Long Break
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreak}
                onChange={(e) => setLongBreak(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Theme & Timezone Card */}
        <div className="card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Palette size={18} className="text-indigo-600" />
            Appearance & Time Zone
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Theme
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Sun size={15} /> Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-indigo-400 text-white font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon size={15} /> Dark Mode
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Time Zone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input w-full cursor-pointer text-xs py-2"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT / BST)</option>
                <option value="Europe/Paris">Paris, Berlin, Rome (CET)</option>
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="Asia/Tokyo">Tokyo, Seoul (JST)</option>
                <option value="Australia/Sydney">Sydney, Melbourne (AEST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <Shield size={18} className="text-rose-600" />
            Security & Password
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Leave these fields blank if you do not wish to change your password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Save size={16} />
            {saving ? 'Saving Preferences...' : 'Save All Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
