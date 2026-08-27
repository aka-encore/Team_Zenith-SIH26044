import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Leaf, LayoutDashboard, Cpu, Target, BookOpen, Briefcase,
  User, LogOut, Sun, Moon, TrendingUp, Sparkles, X, Menu,
  Building2, GraduationCap, School, Settings, Code2, FolderGit2,
  FileText, Award, Bell, Video
} from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';


export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar visibility state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const rawRole = (user?.role || 'student').toLowerCase();
  const isFaculty = ['faculty', 'institution', 'academician'].includes(rawRole);
  const role = isFaculty ? 'faculty' : rawRole;

  // Final 9-Item Consolidated Navigation for Students
  const studentNav = [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "My Profile", path: "/profile", icon: User },
    { label: "Skills & Assessment", path: "/skills", icon: Target },
    { label: "Skill Gap", path: "/skill-gap", icon: Cpu },
    { label: "Opportunities", path: "/opportunities", icon: Briefcase },
    { label: "Applications", path: "/applications", icon: FileText },
    { label: "Interviews & Placement", path: "/interviews", icon: Award },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings }
  ];

  const facultyNav = [
    { label: "Faculty Dashboard", path: "/faculty", icon: LayoutDashboard },
    { label: "Skill Intelligence & Gap", path: "/industry-demand", icon: Cpu },
    { label: "Student Opportunities", path: "/opportunities", icon: Briefcase },
    { label: "Academia × Industry Lab", path: "/academia-lab", icon: Sparkles, highlight: true },
    { label: "Public Home", path: "/", icon: Leaf }
  ];

  const companyNav = [
    { label: "Company Dashboard", path: "/company", icon: LayoutDashboard },
    { label: "Opportunities & Talent", path: "/opportunities", icon: Briefcase },
    { label: "Industry Demand Analytics", path: "/industry-demand", icon: TrendingUp },
    { label: "Academia × Industry Lab", path: "/academia-lab", icon: Sparkles, highlight: true },
    { label: "Public Home", path: "/", icon: Leaf }
  ];

  const adminNav = [
    { label: "Admin Command Center", path: "/admin", icon: LayoutDashboard },
    { label: "Skill Demand Analytics", path: "/industry-demand", icon: Cpu },
    { label: "Platform Opportunities", path: "/opportunities", icon: Briefcase },
    { label: "Academia × Industry Lab", path: "/academia-lab", icon: Sparkles, highlight: true },
    { label: "Public Home", path: "/", icon: Leaf }
  ];

  const navItems = role === 'admin'
    ? adminNav
    : role === 'company'
      ? companyNav
      : role === 'faculty'
        ? facultyNav
        : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (role === 'company') return Building2;
    if (role === 'faculty') return School;
    if (role === 'admin') return Settings;
    return GraduationCap;
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors">
      
      {/* ─── SIDEBAR OVERLAY (Mobile) ─── */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* ─── SIDEBAR (When closed: completely hidden, 0 icons shown) ─── */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out ${
          sidebarOpen 
            ? 'w-72 translate-x-0 shadow-2xl lg:shadow-none' 
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-r-0 p-0 opacity-0 pointer-events-none'
        }`}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full justify-between w-72">
            
            {/* Top Brand & Close Button */}
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight block">SkillNexus AI</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <RoleIcon className="h-3 w-3 inline" />
                      <span>{role === 'admin' ? 'Admin Center' : `${role} Workspace`}</span>
                    </span>
                  </div>
                </Link>

                {/* Close Button (Completely closes sidebar) */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                  title="Close Sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items (Single Active Selection) */}
              <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)] text-left">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Navigation Menu
                </div>

                {navItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  const ItemIcon = item.icon;

                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : item.highlight
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                            : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <ItemIcon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: User Profile Card + Logout */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition cursor-pointer text-left group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden">
                    {user?.avatarUrl || user?.profilePhoto ? (
                      <img src={user.avatarUrl || user.profilePhoto} alt={user?.name || "Profile"} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{user?.name || user?.email}</p>
                    <p className="text-[10px] text-slate-500 truncate">Edit Profile & Password</p>
                  </div>
                </div>
                <Settings className="h-4 w-4 text-slate-400 group-hover:rotate-45 transition-transform shrink-0" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        )}
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* DASHBOARD TOP HEADER */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            
            {/* Sidebar Toggle Button (Opens sidebar when closed) */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-xs font-bold shadow-xs"
              title="Toggle Dashboard Menu"
            >
              <Menu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{sidebarOpen ? 'Hide Menu' : 'Menu'}</span>
            </button>

            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:inline-block">
              {role === 'admin' ? 'Admin Command Center' : `${role} Workspace`}
            </span>
          </div>

          {/* Right Controls: Theme Toggle & User Profile Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-emerald-600" />}
            </button>

            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition cursor-pointer text-right group"
              title="Click to view & edit profile"
            >
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block transition truncate max-w-[140px]">{user?.name || user?.email}</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">{user?.status || 'Active'}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden shadow-xs">
                {user?.avatarUrl || user?.profilePhoto ? (
                  <img src={user.avatarUrl || user.profilePhoto} alt={user?.name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'
                )}
              </div>
            </button>
          </div>
        </header>

        {/* DASHBOARD MAIN VIEW */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ─── USER PROFILE & SETTINGS MODAL ─── */}
      <UserProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />

    </div>
  );
}
