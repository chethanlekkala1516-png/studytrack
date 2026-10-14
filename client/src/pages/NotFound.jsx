import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
          Page Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          The requested study page does not exist or has been relocated.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="btn btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-2"
          >
            <Home size={15} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
