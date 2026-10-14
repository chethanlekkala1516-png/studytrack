import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Flame,
  AlertCircle,
  Plus,
  TrendingUp,
  Target,
  Calendar as CalendarIcon,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Circle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, goalsApi, tasksApi } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { Link } from 'react-router-dom';

export default function Dashboard({ onOpenNewTask }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [goals, setGoals] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [sumData, weekData, goalData, tasksData] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getWeekly(),
        goalsApi.getGoals(),
        tasksApi.getTasks({ date: new Date().toISOString().split('T')[0], limit: 6 })
      ]);

      setSummary(sumData);
      setWeekly(weekData.weekly || []);
      setGoals(goalData);
      setTodayTasks(tasksData.tasks || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTaskStatus = async (task) => {
    try {
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await tasksApi.updateTask(task.id, { status: nextStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner / Hero */}
      <div className="card p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg border-none relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <CalendarIcon size={13} /> {todayDateFormatted}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Good day, {user?.name || 'Student'}!
            </h1>
            <p className="text-sm text-indigo-200/80 mt-1 max-w-xl">
              {summary?.overdueTasks > 0
                ? `You have ${summary.overdueTasks} overdue item(s) to clear today. Keep pushing forward!`
                : "You're in great shape today. Keep up the consistent study momentum!"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Streak Counter Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Flame size={20} className="text-amber-400 fill-amber-400 animate-bounce" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Current Streak</p>
                <p className="text-base font-bold text-white">{goals?.streak?.current || 0} Days</p>
              </div>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onOpenNewTask}
              className="btn bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Plus size={18} /> Add Task
            </button>
          </div>
        </div>

        {/* Subtle Decorative Background Circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-48 h-48 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
      </div>

      {/* Primary Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={summary?.totalTasks || 0}
          subtitle={`${summary?.completedTasks || 0} completed so far`}
          icon={CheckSquare}
          color="indigo"
        />
        <StatCard
          title="Due Today"
          value={summary?.todayTasks || 0}
          subtitle={`${summary?.completedToday || 0} finished today`}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Overdue Tasks"
          value={summary?.overdueTasks || 0}
          subtitle={summary?.overdueTasks > 0 ? 'Requires attention' : 'Clean sheet!'}
          icon={AlertCircle}
          color={summary?.overdueTasks > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Total Focus Time"
          value={`${summary?.totalStudyMinutes || 0}m`}
          subtitle={`${summary?.todayStudyMinutes || 0} mins logged today`}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Daily Goal & Progress Bar Section */}
      <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daily Target Progress</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tasks Target: {goals?.today?.completedTasks || 0}/{goals?.today?.targetTasks || 5} • Study Target: {goals?.today?.completedMinutes || 0}/{goals?.today?.targetMinutes || 120} mins
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {goals?.today?.overallProgress || 0}%
            </span>
            <span className="text-xs text-slate-400 block">Overall Target</span>
          </div>
        </div>

        <ProgressBar
          value={goals?.today?.overallProgress || 0}
          max={100}
          height="h-3"
          color="bg-gradient-to-r from-indigo-500 to-emerald-500"
        />
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Task Completion Chart */}
        <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Weekly Productivity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed vs created tasks over the last 7 days</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
              Last 7 Days
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="completedTasks" name="Completed Tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="createdTasks" name="New Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Study Time Chart */}
        <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Study Minutes Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total focus duration per day (mins)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              Focus Time
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="studyMinutes"
                  name="Study Minutes"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMinutes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Tasks & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Scheduled Tasks */}
        <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarIcon size={16} className="text-indigo-600" />
              Today's Schedule ({todayTasks.length})
            </h3>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              All Tasks <ArrowRight size={13} />
            </Link>
          </div>

          {todayTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              🎯 No tasks due today. Great time to get ahead on upcoming deadlines!
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTaskStatus(t)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {t.status === 'Completed' ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${
                        t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {t.title}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {t.subject} • {t.estimated_duration || 30} mins
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    t.priority === 'High'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : t.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Task Activity Log */}
        <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-600" />
              Recent Task Activity
            </h3>
            <span className="text-[11px] text-slate-400">Live DB Log</span>
          </div>

          <div className="space-y-3">
            {summary?.recentActivity?.length > 0 ? (
              summary.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 text-xs p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Subject: <span className="font-medium">{act.subject}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    act.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : act.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {act.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No recent task logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
