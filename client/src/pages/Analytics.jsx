import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { analyticsApi, studySessionsApi } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [sumRes, weekRes, monthRes, sessRes] = await Promise.all([
          analyticsApi.getSummary(),
          analyticsApi.getWeekly(),
          analyticsApi.getMonthly(),
          studySessionsApi.getSessions(15)
        ]);
        setSummary(sumRes);
        setWeekly(weekRes.weekly || []);
        setMonthly(monthRes);
        setRecentSessions(sessRes.sessions || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Format subject data for Recharts PieChart
  const subjectChartData = (monthly?.subjectStats || []).map((s) => ({
    name: s.subject,
    value: s.total,
    completed: s.completed,
    pending: s.pending
  }));

  // Format priority data
  const priorityChartData = (monthly?.priorityStats || []).map((p) => ({
    priority: p.priority,
    total: p.total,
    completed: p.completed
  }));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 size={26} className="text-indigo-600" />
          Productivity Analytics & Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Deep-dive into your task completion rates, study habits, and subject distribution
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Completion"
          value={`${summary?.overallCompletionRate || 0}%`}
          subtitle={`${summary?.completedTasks || 0} of ${summary?.totalTasks || 0} tasks`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Study Minutes"
          value={`${summary?.totalStudyMinutes || 0}m`}
          subtitle={`${Math.round((summary?.totalStudyMinutes || 0) / 60)} hrs total focus`}
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Current Streak"
          value={`${summary?.currentStreak || 0} Days`}
          subtitle={`Best: ${summary?.bestStreak || 0} consecutive days`}
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Overdue Tasks"
          value={summary?.overdueTasks || 0}
          subtitle={summary?.overdueTasks === 0 ? 'Everything on time!' : 'Pending attention'}
          icon={AlertTriangle}
          color={summary?.overdueTasks > 0 ? 'rose' : 'blue'}
        />
      </div>

      {/* Subject Distribution & Priority Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Task Distribution (PieChart) */}
        <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PieIcon size={16} className="text-indigo-600" />
                Subject Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total tasks allocated per course</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {subjectChartData.length} Subjects
            </span>
          </div>

          {subjectChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No subject data recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Priority Breakdown (BarChart) */}
        <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                Priority Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed vs total by priority tier</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              High / Med / Low
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="priority" stroke="#94a3b8" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="total" name="Total Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.5} />
                <Bar dataKey="completed" name="Completed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 30-Day Study Trend Area Chart */}
      <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              Focus Study Activity Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daily focus study minutes recorded in SQLite</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
            Recorded Sessions
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly?.studyTrend || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
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
                dataKey="minutes"
                name="Study Minutes"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Study Session Log Table */}
      <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
          Detailed Study Session History
        </h3>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No study sessions logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Associated Task</th>
                  <th className="pb-2.5 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {new Date(s.completed_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s.session_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                      {s.task_title ? `${s.task_subject}: ${s.task_title}` : '—'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {s.duration_minutes}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
