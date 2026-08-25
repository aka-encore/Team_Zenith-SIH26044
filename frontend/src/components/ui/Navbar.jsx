import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dna, Menu, X, LogIn, LogOut, UserPlus, Sparkles } from 'lucide-react';
import { Button } from './Button';

export function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", path: "/" },
    { label: "Student Workspace", path: "/student" },
    { label: "Skill DNA", path: "/skill-dna" },
    { label: "Industry Demand", path: "/industry-demand" },
    { label: "Opportunities", path: "/opportunities" },
    { label: "Company Portal", path: "/company" },
    { label: "College Portal", path: "/institution" },
    { label: "Academia × Lab", path: "/academia-lab" },
    { label: "Design System", path: "/design-system" }
  ];

  return (
    <header className="sticky top-0 z-50 sb-glass-card border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* SkillNexus AI Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-blue-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dna className="h-5 w-5 text-blue-400 group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-1.5">
                <span>SkillNexus AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono uppercase">
                  Platform
                </span>
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">Connecting student potential with industry demand</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center space-x-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Bar */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{user.name || user.email}</span>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">{user.role}</span>
                </div>
                <Button variant="ghost" size="sm" icon={LogOut} onClick={onLogout} title="Logout" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function Sidebar({ items = [], activePath, onNavigate }) {
  return (
    <aside className="w-64 sb-glass-card border-r border-slate-800 p-4 space-y-2 hidden md:block min-h-[calc(100vh-5rem)]">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
        Navigation
      </div>
      {items.map((item) => {
        const isActive = activePath === item.path;
        const IconComponent = item.icon;

        return (
          <button
            key={item.path}
            onClick={() => onNavigate && onNavigate(item.path)}
            className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
