import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Leaf, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';


export function PublicNavbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);


  const publicLinks = [
    { label: "Home", path: "/" },
    { label: "Opportunities", path: "/opportunities" },
    { label: "Skill Assessment", path: "/skill-dna" },
    { label: "Collaborations", path: "/academia-lab" },
    { label: "Analytics", path: "/industry-demand" }
  ];


  const registerRoles = [
    { label: 'Student', description: 'Build your verified Skill Passport', value: 'student' },
    { label: 'Industry', description: 'Find competency-verified talent', value: 'industry' },
    { label: 'Faculty', description: 'Strengthen academia-industry outcomes', value: 'faculty' }
  ];


  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ─── AYUSH Portal Logo Brand ─── */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight block leading-tight">
                AYUSH Portal
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-semibold leading-tight">
                Team Zenith — SIH26044
              </span>
            </div>
          </Link>


          {/* ─── Public Navigation Links ─── */}
          <nav className="hidden md:flex items-center space-x-1">
            {publicLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>


          {/* ─── Right Actions: Theme Toggle + Auth Buttons ─── */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden lg:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-emerald-600" />
                  <span className="hidden lg:inline">Dark Mode</span>
                </>
              )}
            </button>


            {/* Auth Buttons */}
            <Link
              to="/login"
              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 transition"
            >
              Login
            </Link>

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsRoleMenuOpen((isOpen) => !isOpen)}
                aria-expanded={isRoleMenuOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                Register
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl shadow-slate-950/15" role="menu">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Join as</p>
                  {registerRoles.map((role) => (
                    <Link
                      key={role.value}
                      to={`/register?role=${role.value}`}
                      role="menuitem"
                      onClick={() => setIsRoleMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                    >
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">{role.label}</span>
                      <span className="block pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{role.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="inline-flex p-2 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>

        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 py-3 md:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                >
                  {link.label}
                </Link>
              ))}
              <p className="px-3 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Register as</p>
              {registerRoles.map((role) => (
                <Link
                  key={role.value}
                  to={`/register?role=${role.value}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                  {role.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
