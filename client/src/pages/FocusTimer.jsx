import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  Coffee,
  Sparkles,
  Flame,
  Volume2
} from 'lucide-react';
import { studySessionsApi, tasksApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function FocusTimer() {
  const { settings } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  // Mode: 'focus', 'short_break', 'long_break'
  const [mode, setMode] = useState('focus');
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(
    location.state?.selectedTaskId || ''
  );

  // Durations from settings or default
  const focusMinutes = settings?.focus_duration || 25;
  const shortBreakMinutes = settings?.short_break || 5;
  const longBreakMinutes = settings?.long_break || 15;

  const getDurationForMode = (m) => {
    if (m === 'focus') return focusMinutes * 60;
    if (m === 'short_break') return shortBreakMinutes * 60;
    return longBreakMinutes * 60;
  };

  const [timeLeft, setTimeLeft] = useState(getDurationForMode('focus'));
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // History & stats
  const [sessionHistory, setSessionHistory] = useState([]);
  const [stats, setStats] = useState({ totalMinutes: 0, todayMinutes: 0 });

  const intervalRef = useRef(null);

  // Load available pending tasks and past sessions
  const loadData = async () => {
    try {
      const [tasksRes, sessionsRes] = await Promise.all([
        tasksApi.getTasks({ status: 'Pending', limit: 30 }),
        studySessionsApi.getSessions(10)
      ]);
      setTasks(tasksRes.tasks || []);
      setSessionHistory(sessionsRes.sessions || []);
      setStats(sessionsRes.stats || { totalMinutes: 0, todayMinutes: 0 });
    } catch (err) {
      console.error('Failed to load focus timer data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update timer duration when mode or settings change and timer is idle
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode));
    }
  }, [mode, settings]);

  // Audio tone helper
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // AudioContext not allowed or not supported in environment
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleSessionComplete = async () => {
    playChime();
    const durationMins = Math.round(getDurationForMode(mode) / 60);

    try {
      await studySessionsApi.logSession({
        duration_minutes: durationMins,
        session_type: mode,
        task_id: selectedTaskId ? parseInt(selectedTaskId, 10) : null
      });

      if (mode === 'focus') {
        addToast(`🎉 Awesome focus session! Logged ${durationMins} minutes to your productivity record.`, 'success');
        setCompletedSessionsCount((c) => c + 1);
        // Prompt for short or long break
        const nextMode = (completedSessionsCount + 1) % 4 === 0 ? 'long_break' : 'short_break';
        setMode(nextMode);
      } else {
        addToast('Break finished! Ready to dive back in?', 'info');
        setMode('focus');
      }

      loadData();
    } catch (err) {
      console.error('Failed to log session:', err);
      addToast('Session completed, but logging to database failed.', 'error');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalDuration = getDurationForMode(mode);
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Focus Pomodoro Timer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Lock in uninterrupted study sessions, beat procrastination, and log real study minutes
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('focus');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> Focus ({focusMinutes}m)
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setMode('short_break');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'short_break'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Coffee size={14} /> Short Break ({shortBreakMinutes}m)
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setMode('long_break');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'long_break'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Coffee size={14} /> Long Break ({longBreakMinutes}m)
          </button>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="card p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg relative overflow-hidden">
        {/* Optional Task Linking Dropdown */}
        <div className="max-w-xs mx-auto mb-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Focusing on Task:
          </label>
          <div className="relative">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={isRunning}
              className="input w-full text-xs py-2 pr-8 cursor-pointer disabled:opacity-60"
            >
              <option value="">General Study (No specific task)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subject}: {t.title}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <BookOpen size={14} />
            </div>
          </div>
        </div>

        {/* Circular Countdown Progress SVG */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="12"
              className={`transition-all duration-1000 ease-linear ${
                mode === 'focus'
                  ? 'text-indigo-600'
                  : mode === 'short_break'
                  ? 'text-emerald-500'
                  : 'text-blue-500'
              }`}
              fill="transparent"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
              {mode.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset Timer"
            aria-label="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-base text-white shadow-lg flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={20} /> Pause
              </>
            ) : (
              <>
                <Play size={20} /> {timeLeft < totalDuration ? 'Resume' : 'Start Focus'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Focus Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs font-semibold uppercase text-slate-400">Today's Focus</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.todayMinutes}m
          </p>
          <span className="text-[11px] text-slate-500">minutes recorded</span>
        </div>

        <div className="card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs font-semibold uppercase text-slate-400">Total All-Time</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.totalMinutes}m
          </p>
          <span className="text-[11px] text-slate-500">cumulative study</span>
        </div>

        <div className="col-span-2 md:col-span-1 card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs font-semibold uppercase text-slate-400">Completed Blocks</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {completedSessionsCount}
          </p>
          <span className="text-[11px] text-slate-500">in current session</span>
        </div>
      </div>

      {/* Recent Study Session History */}
      <div className="card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Clock size={16} className="text-indigo-600" />
          Recent Study Sessions Log
        </h3>

        {sessionHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No study sessions logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessionHistory.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {s.session_type.replace('_', ' ')}
                    </span>
                    {s.task_title && (
                      <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                        • {s.task_title}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {s.duration_minutes} mins
                  </span>
                  <span>{new Date(s.completed_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
