import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dna, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';


export function PublicNavbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();


  const publicLinks = [
    { label: "Home", path: "/" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "About", path: "/about" }
  ];


  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* SkillBridge Logo Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-blue-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dna className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight block">
                SkillBridge
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-semibold">SkillBridge Platform</span>
            </div>
          </Link>


          {/* Minimal Public Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-1">
            {publicLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>


          {/* Right Actions: Theme Switcher + Login / Register */}
          <div className="flex items-center space-x-3">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden md:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-600" />
                  <span className="hidden md:inline">Dark Mode</span>
                </>
              )}
            </button>


            {/* Auth Buttons */}
            <Link
              to="/login"
              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
            >
              Register
            </Link>

          </div>

        </div>
      </div>
    </header>
  );
}
