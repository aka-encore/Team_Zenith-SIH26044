import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, User, Lock, Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const result = await register(name, email, password, role);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      
      // If it's a company, they are pending, do not redirect automatically, let them read the message
      if (result.isPending) {
        setName('');
        setEmail('');
        setPassword('');
      } else {
        // Logged in immediately, wait 1.5s then redirect
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="bg-purple-600 p-3 rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center">
            <Shield className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white tracking-tight">
          Create portal account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition duration-150">
            sign in to your dashboard
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          
          {successMsg ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-400 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
                {successMsg}
              </p>
              {role === 'company' ? (
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-flex justify-center items-center space-x-2 py-2.5 px-6 border border-slate-700 hover:border-slate-650 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-sm transition duration-150 cursor-pointer"
                  >
                    <span>Back to Login</span>
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-indigo-400 animate-pulse pt-2">
                  Redirecting to your dashboard...
                </p>
              )}
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error Message banner */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium animate-shake">
                  {errorMsg}
                </div>
              )}

              {/* Name input */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-300">
                  Full Name / Organization Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-550" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-550" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150 sm:text-sm"
                    placeholder="email@domain.com"
                  />
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-slate-300">
                  Register As
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150 sm:text-sm cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="company">Industry / Company</option>
                    <option value="academician">Academician</option>
                    <option value="institution">Educational Institution</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {role === 'company' && (
                  <p className="mt-1.5 text-xs text-amber-400 font-medium">
                    Note: Company accounts require verification and approval from portal administrators before dashboard access is fully granted.
                  </p>
                )}
              </div>

              {/* Password input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-550" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150 sm:text-sm"
                    placeholder="Min. 6 characters"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-400 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition duration-150 disabled:opacity-50 cursor-pointer shadow-purple-600/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
