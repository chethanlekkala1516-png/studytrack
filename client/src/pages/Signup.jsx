import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      addToast('Account created successfully! Welcome to StudyTrack.', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
            Create Student Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Start managing assignments, study sessions & streaks
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="input w-full pl-10"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Student Email
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
                placeholder="Minimum 6 characters"
                className="input w-full pl-10"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
            {loading ? 'Creating Account...' : 'Register Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
