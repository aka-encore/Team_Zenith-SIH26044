import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Dna, Leaf, LayoutDashboard, Cpu, Award, Target, Compass, BookOpen, Briefcase,
  FileText, Bookmark, Folder, User, Settings, LogOut, Sun, Moon, 
  Users, Building2, TrendingUp, Layers, Sparkles, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const role = user?.role || 'student';

  const studentNav = [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { 
      group: "My Skills",
      items: [
        { label: "Skill DNA", path: "/skill-dna", icon: Dna },
        { label: "Skill Assessment", path: "/skill-dna", icon: Target },
        { label: "Skill Gap", path: "/industry-demand", icon: Cpu }
      ]
    },
    { 
      group: "Career",
      items: [
        { label: "Career Roadmap", path: "/student", icon: Compass },
        { label: "Learning", path: "/student", icon: BookOpen }
      ]
    },
    { 
      group: "Opportunities",
      items: [
        { label: "Explore", path: "/opportunities", icon: Briefcase },
        { label: "Applications", path: "/opportunities", icon: FileText },
        { label: "Saved", path: "/opportunities", icon: Bookmark }
      ]
    },
    { 
      group: "Projects",
      items: [
        { label: "My Portfolio", path: "/student", icon: Folder }
      ]
    },
    { label: "Profile", path: "/student", icon: User }
  ];

  const companyNav = [
    { label: "Dashboard", path: "/company", icon: LayoutDashboard },
    { 
      group: "Talent",
      items: [
        { label: "Find Students", path: "/company", icon: Users },
        { label: "Candidates", path: "/company", icon: User },
        { label: "Shortlisted", path: "/company", icon: Award }
      ]
    },
    { 
      group: "Opportunities",
      items: [
        { label: "My Opportunities", path: "/opportunities", icon: Briefcase },
        { label: "Create Opportunity", path: "/company", icon: Sparkles }
      ]
    },
    { label: "Projects", path: "/company", icon: Folder },
    { label: "Assessments", path: "/company", icon: Target },
    { label: "Analytics", path: "/industry-demand", icon: TrendingUp },
    { label: "Company Profile", path: "/company", icon: Building2 }
  ];

  const institutionNav = [
    { label: "Dashboard", path: "/institution", icon: LayoutDashboard },
    { label: "Students", path: "/institution", icon: Users },
    { label: "Skill Intelligence", path: "/institution", icon: Cpu },
    { label: "Industry Demand", path: "/industry-demand", icon: TrendingUp },
    { label: "Skill Gap", path: "/institution", icon: Target },
    { label: "Training", path: "/institution", icon: BookOpen },
    { label: "Internships", path: "/institution", icon: Briefcase },
    { label: "Placement", path: "/institution", icon: Award },
    { label: "Industry Partners", path: "/institution", icon: Building2 },
    { label: "Analytics", path: "/industry-demand", icon: Layers },
    { label: "✦ Academia × Industry Lab", path: "/academia-lab", icon: Sparkles, highlight: true }
  ];

  const navItems = role === 'company' 
    ? companyNav 
    : (role === 'institution' || role === 'admin') 
      ? institutionNav 
      : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors">
      
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col justify-between border-r border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 sticky top-0 h-screen z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        <div>
          {/* Logo Brand Header */}
          <div className="p-4 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-600/20">
                <Leaf className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div className="text-left">
                  <span className="text-base font-black text-slate-900 dark:text-white tracking-tight block">SkillNexus AI</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block uppercase font-bold">{role} Workspace</span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Sidebar Nav Items */}
          <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] text-left">
            {navItems.map((item, idx) => {
              if (item.group) {
                return (
                  <div key={idx} className="space-y-1 pt-2">
                    {!collapsed && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 block">
                        {item.group}
                      </span>
                    )}
                    {item.items.map((sub, sIdx) => {
                      const isActive = location.pathname === sub.path;
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          <SubIcon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{sub.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                );
              }

              const isActive = location.pathname === item.path;
              const ItemIcon = item.icon;

              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    item.highlight
                      ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/20 font-bold'
                      : isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <ItemIcon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t border-slate-300 dark:border-slate-800 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-64 bg-white dark:bg-slate-950 p-4 space-y-4 text-left border-r border-slate-300 dark:border-slate-800 h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-slate-800">
              <span className="font-extrabold text-slate-900 dark:text-white">SkillNexus AI Dashboard</span>
              <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {navItems.map((item, idx) => {
                if (item.group) {
                  return (
                    <div key={idx} className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{item.group}</span>
                      {item.items.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          onClick={() => setMobileDrawerOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                          <sub.icon className="h-4 w-4 text-blue-600" />
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  );
                }
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    <item.icon className="h-4 w-4 text-blue-600" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* DASHBOARD TOP HEADER */}
        <header className="h-16 border-b border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden sm:inline-block">
              {role.toUpperCase()} WORKSPACE
            </span>
          </div>

          {/* Right Controls: Theme Toggle & User Info */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">{user?.name || user?.email}</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">{user?.status || 'Active'}</span>
            </div>
          </div>
        </header>

        {/* DASHBOARD MAIN VIEW */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
