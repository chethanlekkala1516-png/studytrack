import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      addToast('Welcome back to StudyTrack!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login({ email: 'alex.study@example.com', password: 'password123' });
      addToast('Logged in as Alex Morgan (Demo Student)!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.study@example.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            StudyTrack
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student Daily To-Do List & Productivity Tracker
          </p>
        </div>

        {/* Demo Account Callout */}
        <div className="mb-5 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-indigo-950 dark:text-indigo-100 font-bold">
                Instant Demo Access
              </p>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 truncate">
                Preloaded with tasks, timer logs & streak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-1.5 rounded-xl shadow-sm shadow-indigo-600/20 whitespace-nowrap flex-shrink-0"
          >
            {loading ? 'Logging in...' : '1-Click Login'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="input w-full pl-10"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pl-10"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2 shadow-md shadow-indigo-600/20"
          >
            {loading ? 'Signing in...' : 'Sign In to StudyTrack'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
