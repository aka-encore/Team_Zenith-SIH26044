import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * OAuthCallback
 *
 * The backend redirects here after a successful OAuth flow:
 *   http://localhost:5173/auth/callback?token=JWT&user=JSON
 *
 * This page reads the token + user from URL params, stores them
 * via loginWithToken, then redirects to the correct dashboard.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const oauthError = searchParams.get('oauth_error');

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      return;
    }

    if (!token || !userRaw) {
      setError('Authentication data missing. Please try signing in again.');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      loginWithToken(token, user);

      // Redirect to role-appropriate dashboard
      const dashboardMap = {
        student: '/student',
        company: '/company',
        institution: '/institution',
        academician: '/institution',
        admin: '/admin',
      };

      const destination = dashboardMap[user.role] || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('OAuthCallback parse error:', err);
      setError('Failed to complete sign-in. Please try again.');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <h2 className="text-white font-bold text-lg">Sign-in failed</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-400 animate-spin mx-auto" />
        <p className="text-slate-300 text-sm font-semibold">Completing sign-in…</p>
      </div>
    </div>
  );
}
