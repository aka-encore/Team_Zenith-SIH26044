import React, { useState } from 'react';
import { X, Mail, Lock, CheckCircle2, ArrowRight, KeyRound, Loader2, AlertCircle, RefreshCw } from 'lucide-react';


export function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Step 1: Send OTP to user's email via SMTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setStep(2);
    } catch (err) {
      setError(err.message || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccessMsg(data.message || 'Your password has been successfully reset!');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      alert(`A new verification code was sent to ${email}`);
    } catch (err) {
      setError(err.message || 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 text-left shadow-2xl relative transition-colors">
        
        {/* Close Modal Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold">
            <KeyRound className="h-3 w-3" />
            <span>SMTP Email Verification</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Reset Your Password</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 1 && 'Enter your registered email to receive a 6-digit verification code.'}
            {step === 2 && `Enter the OTP sent to ${email} and your new password.`}
            {step === 3 && 'Password successfully updated.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start space-x-2.5 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Registered Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl text-xs outline-none font-semibold focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Sending OTP Code…</span></>
              ) : (
                <><span>Send 6-Digit OTP</span><ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">6-Digit Verification Code</label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Resend Code</span>
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-2.5 text-center tracking-[8px] font-mono font-extrabold text-base bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl outline-none focus:border-emerald-500 transition"
              />
              <p className="text-[11px] text-slate-500 text-center">Check your inbox or spam for an email from <strong>sih96880@gmail.com</strong></p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs outline-none font-semibold focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs outline-none font-semibold focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying & Updating…</span></>
              ) : (
                <span>Set New Password</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div className="text-center py-5 space-y-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Password Reset Complete</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">{successMsg}</p>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
