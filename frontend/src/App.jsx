import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Header Navbar
import { PublicNavbar } from './components/PublicNavbar';
import { DashboardLayout } from './components/DashboardLayout';

// Public & Common Pages
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import AcademiaIndustryLab from './pages/AcademiaIndustryLab';
import DesignSystemShowcase from './pages/DesignSystemShowcase';
import OAuthCallback from './pages/OAuthCallback';
import OAuthRoleSelect from './pages/OAuthRoleSelect';
import Login from './pages/Login';
import Register from './pages/Register';

// Role Dashboard Views
import CompanyDashboardView from './pages/CompanyDashboardView';
import CollegeDashboardView from './pages/CollegeDashboardView';
import AdminDashboardView from './pages/AdminDashboardView';

// Consolidated 9 Student Portal Pages
import StudentDashboardView from './pages/StudentDashboardView';
import StudentProfilePage from './pages/StudentProfilePage';
import SkillsAssessmentPage from './pages/SkillsAssessmentPage';
import SkillGapPage from './pages/SkillGapPage';
import OpportunityDiscoveryPage from './pages/OpportunityDiscoveryPage';
import StudentApplicationsPage from './pages/StudentApplicationsPage';
import StudentInterviewsPage from './pages/StudentInterviewsPage';
import StudentNotificationsPage from './pages/StudentNotificationsPage';
import StudentSettingsPage from './pages/StudentSettingsPage';


function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If user is already authenticated and visits /login or /register, redirect to their role dashboard
  useEffect(() => {
    if (!loading && user && ['/login', '/register'].includes(location.pathname)) {
      const userRole = (user?.role || '').toLowerCase();
      const defaultDashboardPath = userRole === 'company' 
        ? '/company' 
        : (userRole === 'faculty' || userRole === 'institution' || userRole === 'academician') 
          ? '/faculty' 
          : userRole === 'admin' 
            ? '/admin' 
            : '/student';
      navigate(defaultDashboardPath, { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // Show clean spinner while restoring auth session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] flex flex-col items-center justify-center text-slate-500 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs font-mono font-bold tracking-wider text-slate-400">Restoring SkillNexus AI Workspace...</span>
      </div>
    );
  }

  // If user is logged in or on a dashboard route, render inside DashboardLayout with role sidebar
  const shouldUseDashboardLayout = user && !['/login', '/register'].includes(location.pathname);

  if (shouldUseDashboardLayout) {
    const userRole = (user?.role || '').toLowerCase();
    const defaultDashboardPath = userRole === 'company' 
      ? '/company' 
      : (userRole === 'faculty' || userRole === 'institution' || userRole === 'academician') 
        ? '/faculty' 
        : userRole === 'admin' 
          ? '/admin' 
          : '/student';

    return (
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* ══════════════ 1. CONSOLIDATED 9 STUDENT PORTAL ROUTES ══════════════ */}
          {/* 1. Dashboard */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentDashboardView onNavigate={(view) => navigate(`/${view}`)} />
              </ProtectedRoute>
            } 
          />

          {/* 2. My Profile (Personal & Academic, Projects, Certifications, Resume, Social Links) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* 3. Skills & Assessment (My Skills, Skill Assessment, Assessment History) */}
          <Route 
            path="/skills" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <SkillsAssessmentPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/assessment" element={<Navigate to="/skills" replace />} />

          {/* 4. Skill Gap (Skill DNA, Industry Demand, Missing Skills, Weak Skills, Recommendations) */}
          <Route 
            path="/skill-gap" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'faculty', 'institution']}>
                <SkillGapPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/skill-dna" element={<Navigate to="/skill-gap" replace />} />
          <Route path="/industry-demand" element={<Navigate to="/skill-gap" replace />} />

          {/* 5. Opportunities (Jobs, Internships, Search, Filters, Recommended, Apply) */}
          <Route 
            path="/opportunities" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'faculty', 'company']}>
                <OpportunityDiscoveryPage />
              </ProtectedRoute>
            } 
          />

          {/* 6. Applications (Track Job & Internship Application Statuses) */}
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentApplicationsPage />
              </ProtectedRoute>
            } 
          />

          {/* 7. Interviews & Placement (Scheduled Interviews, Drives, Offers) */}
          <Route 
            path="/interviews" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentInterviewsPage />
              </ProtectedRoute>
            } 
          />

          {/* 8. Notifications (Real-Time Career Alerts) */}
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'faculty', 'company']}>
                <StudentNotificationsPage />
              </ProtectedRoute>
            } 
          />

          {/* 9. Settings (Security, Preferences, Themes) */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'faculty', 'company']}>
                <StudentSettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* ══════════════ FACULTY, COMPANY & ADMIN ROUTES ══════════════ */}
          <Route 
            path="/faculty" 
            element={
              <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician', 'admin']}>
                <CollegeDashboardView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/institution" 
            element={
              <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician', 'admin']}>
                <CollegeDashboardView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company" 
            element={
              <ProtectedRoute allowedRoles={['company', 'admin']}>
                <CompanyDashboardView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardView />
              </ProtectedRoute>
            } 
          />

          {/* Shared Lab & Design System */}
          <Route path="/academia-lab" element={<AcademiaIndustryLab />} />
          <Route path="/design-system" element={<DesignSystemShowcase />} />

          {/* Fallback to user's assigned role dashboard */}
          <Route path="*" element={<Navigate to={defaultDashboardPath} replace />} />
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

  // Home page renders full-bleed
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors selection:bg-emerald-600 selection:text-white">
      <PublicNavbar />

      {isHomePage ? (
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col justify-center">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">SkillNexus AI Enterprise v3.2</span>
            <span>• SIH AI-Driven Micro-Curricular & Dynamic Placement Engine</span>
          </div>
          <div>© 2026 SkillNexus. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
