import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dna, GraduationCap, Building2, BookOpen, Loader2, AlertCircle } from 'lucide-react';

/**
 * OAuthRoleSelect
 *
 * Shown when a brand-new OAuth user has no role yet.
 * The backend redirects here with a short-lived tempToken:
 *   http://localhost:5173/auth/oauth/role?tempToken=JWT
 *
 * The user picks a role, we POST to /api/auth/oauth/role,
 * and on success we store the real JWT and redirect to dashboard.
 */
const ROLES = [
  {
    id: 'student',
    label: 'Student',
    desc: 'Discover opportunities, build skills, and connect with industry.',
    icon: GraduationCap,
  },
  {
    id: 'company',
    label: 'Company',
    desc: 'Post opportunities, find talent, and build your pipeline.',
    icon: Building2,
  },
  {
    id: 'institution',
    label: 'Institution',
    desc: 'Empower students and track placement outcomes.',
    icon: BookOpen,
  },
];

export default function OAuthRoleSelect() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    const t = searchParams.get('tempToken');
    if (!t) {
      setError('Session expired or invalid. Please sign in again.');
    } else {
      setTempToken(t);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tempToken) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/oauth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      loginWithToken(data.token, data.user);

      const dashboardMap = {
        student: '/student',
        company: '/company',
        institution: '/institution',
      };
      navigate(dashboardMap[selectedRole] || '/', { replace: true });

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] px-4">
      <div className="w-full max-w-[460px] bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40 space-y-6">

        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Dna className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black text-white tracking-tight block">SkillNexus AI</span>
            <span className="text-[10px] text-slate-400 font-semibold block">One last step</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Choose your role</h2>
          <p className="text-sm text-slate-400 mt-1">
            We just need to know how you'll be using SkillNexus AI.
          </p>
        </div>

        {error && (
          <div className="flex items-start space-x-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`w-full flex items-start space-x-3 p-4 rounded-xl border text-left transition cursor-pointer ${
                selectedRole === role.id
                  ? 'bg-blue-600/10 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${selectedRole === role.id ? 'bg-blue-600/20' : 'bg-slate-800'}`}>
                <role.icon className={`h-4 w-4 ${selectedRole === role.id ? 'text-blue-400' : 'text-slate-500'}`} />
              </div>
              <div>
                <span className="font-bold text-sm block">{role.label}</span>
                <span className="text-xs text-slate-500 leading-relaxed">{role.desc}</span>
              </div>
              <div className={`ml-auto shrink-0 w-4 h-4 rounded-full border-2 mt-1 ${
                selectedRole === role.id ? 'border-blue-500 bg-blue-500' : 'border-slate-700'
              }`} />
            </button>
          ))}

          <button
            type="submit"
            disabled={submitting || !!error}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account…</span>
              </>
            ) : (
              <span>Continue as {ROLES.find(r => r.id === selectedRole)?.label} →</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Changed your mind?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:underline font-bold"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
