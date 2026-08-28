import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const dashboardPathFor = (role) => {
  const normalizedRole = (role || '').toLowerCase();

  if (normalizedRole === 'company') return '/company';
  if (['faculty', 'institution', 'academician'].includes(normalizedRole)) return '/faculty';
  if (normalizedRole === 'admin') return '/admin';
  return '/student';
};

export default function NotFoundPage() {
  const { user } = useAuth();
  const homePath = user ? dashboardPathFor(user.role) : '/';

  return (
    <section className="w-full max-w-xl mx-auto text-center py-12 sm:py-20">
      <p className="text-sm font-bold tracking-[0.28em] text-emerald-600 dark:text-emerald-400">ERROR 404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed">
        The page you requested does not exist, may have moved, or you may not have permission to access it.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to={homePath}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700"
        >
          <Home className="h-4 w-4" />
          {user ? 'Go to dashboard' : 'Go to home'}
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    </section>
  );
}
