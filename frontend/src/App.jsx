import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// Import New AI Platform Pages
import HomePage from './pages/HomePage';
import StudentDashboardView from './pages/StudentDashboardView';
import SkillDnaPage from './pages/SkillDnaPage';
import IndustryDemandPage from './pages/IndustryDemandPage';
import OpportunityDiscoveryPage from './pages/OpportunityDiscoveryPage';
import CompanyDashboardView from './pages/CompanyDashboardView';
import CollegeDashboardView from './pages/CollegeDashboardView';
import AcademiaIndustryLab from './pages/AcademiaIndustryLab';
import DesignSystemShowcase from './pages/DesignSystemShowcase';

import { 
  Sparkles, Dna, TrendingUp, Briefcase, GraduationCap, Building2, 
  Layers, LogIn, LogOut, UserPlus, Shield, User, Menu, X, Palette
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/", icon: Sparkles },
    { name: "Student", path: "/student", icon: User },
    { name: "Skill DNA", path: "/skill-dna", icon: Dna },
    { name: "Industry Demand", path: "/industry-demand", icon: TrendingUp },
    { name: "Opportunities", path: "/opportunities", icon: Briefcase },
    { name: "Company", path: "/company", icon: Building2 },
    { name: "College", path: "/institution", icon: GraduationCap },
    { name: "Academia × Lab", path: "/academia-lab", icon: Layers },
    { name: "Design System", path: "/design-system", icon: Palette, highlight: true }
  ];

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* SkillBridge Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-blue-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dna className="h-5 w-5 text-blue-400 group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-white tracking-tight flex items-center space-x-1.5">
                <span>SkillBridge</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono">
                  SIH26044
                </span>
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">Connecting student potential with industry demand</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : link.highlight
                        ? 'text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right User Status / Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{user.name || user.email}</span>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/60"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl shadow-md shadow-blue-600/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2 text-left">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-900"
            >
              <link.icon className="h-4 w-4 text-blue-400" />
              <span>{link.name}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20"
              >
                Logout ({user.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-slate-200 bg-slate-900 rounded-xl border border-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MainLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Routes>
          <Route path="/" element={<HomePage onSelectTab={(tab) => navigate(`/${tab}`)} />} />
          <Route path="/student" element={<StudentDashboardView onNavigate={(view) => navigate(`/${view}`)} />} />
          <Route path="/skill-dna" element={<SkillDnaPage />} />
          <Route path="/industry-demand" element={<IndustryDemandPage />} />
          <Route path="/opportunities" element={<OpportunityDiscoveryPage />} />
          <Route path="/company" element={<CompanyDashboardView />} />
          <Route path="/institution" element={<CollegeDashboardView />} />
          <Route path="/academia-lab" element={<AcademiaIndustryLab />} />
          <Route path="/design-system" element={<DesignSystemShowcase />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Role specific fallbacks */}
          <Route path="/recruiter" element={<CompanyDashboardView />} />
          <Route path="/admin" element={<CollegeDashboardView />} />

          <Route path="*" element={<HomePage onSelectTab={(tab) => navigate(`/${tab}`)} />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">SkillBridge • Connecting student potential with industry demand</span>
          </div>
          <div>
            <span>SIH26044 Enterprise Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}
