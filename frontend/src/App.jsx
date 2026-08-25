import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';


// Public Header Navbar
import { PublicNavbar } from './components/PublicNavbar';
import { DashboardLayout } from './components/DashboardLayout';


// Pages
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import StudentDashboardView from './pages/StudentDashboardView';
import SkillDnaPage from './pages/SkillDnaPage';
import IndustryDemandPage from './pages/IndustryDemandPage';
import OpportunityDiscoveryPage from './pages/OpportunityDiscoveryPage';
import CompanyDashboardView from './pages/CompanyDashboardView';
import CollegeDashboardView from './pages/CollegeDashboardView';
import AcademiaIndustryLab from './pages/AcademiaIndustryLab';
import DesignSystemShowcase from './pages/DesignSystemShowcase';
import OAuthCallback from './pages/OAuthCallback';
import OAuthRoleSelect from './pages/OAuthRoleSelect';
import Login from './pages/Login';
import Register from './pages/Register';


function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();


  // If user is logged in or on a dashboard route, render inside DashboardLayout with role sidebar
  const shouldUseDashboardLayout = user && !['/login', '/register'].includes(location.pathname);


  if (shouldUseDashboardLayout) {
    return (
      <DashboardLayout>
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
          <Route path="*" element={<StudentDashboardView onNavigate={(view) => navigate(`/${view}`)} />} />
        </Routes>
      </DashboardLayout>
    );
  }


  // OAuth callback pages — full viewport, no navbar/footer
  if (location.pathname === '/auth/callback' || location.pathname === '/auth/oauth/role') {
    return (
      <Routes>
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/auth/oauth/role" element={<OAuthRoleSelect />} />
      </Routes>
    );
  }


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors selection:bg-blue-600 selection:text-white">
      <PublicNavbar />

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Routes>
          <Route path="/" element={<HomePage onSelectTab={(tab) => navigate(`/${tab}`)} />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/opportunities" element={<OpportunityDiscoveryPage />} />
          <Route path="/skill-dna" element={<SkillDnaPage />} />
          <Route path="/academia-lab" element={<AcademiaIndustryLab />} />
          <Route path="/industry-demand" element={<IndustryDemandPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/design-system" element={<DesignSystemShowcase />} />
          {/* Fallback to Login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-300 font-bold">SkillNexus AI • Connecting student potential with industry demand</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-400">SkillNexus AI Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
