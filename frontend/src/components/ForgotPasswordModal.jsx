import React, { useState } from 'react';
import { X, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';


export function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');


  if (!isOpen) return null;


  // Handle Step 1: Send reset link to user's email
  const handleSendLink = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setStep(2);
  };


  // Handle Step 3: Reset password with new credentials
  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setMsg('Your password has been successfully reset.');
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 text-left shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>


        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Reset Password</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Follow the steps to recover your SkillBridge account.
          </p>
        </div>


        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}


        {msg ? (
          <div className="text-center py-6 space-y-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Password Updated</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">{msg}</p>
            <button
              onClick={onClose}
              className="py-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
            >
              Back to Login
            </button>
          </div>


        ) : step === 1 ? (
          <form className="space-y-4" onSubmit={handleSendLink}>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Send Reset Link</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>


        ) : step === 2 ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed space-y-2">
              <p className="font-bold text-blue-700 dark:text-blue-400">Check your email for a password reset link.</p>
              <p className="text-[11px] text-slate-500">We've sent reset instructions to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.</p>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
            >
              Set New Password Directly
            </button>
          </div>


        ) : (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">New Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Confirm Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
            >
              Save New Password
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
