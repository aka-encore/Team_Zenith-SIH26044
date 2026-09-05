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
import DesignSystemShowcase from './pages/DesignSystemShowcase';
import OAuthCallback from './pages/OAuthCallback';
import OAuthRoleSelect from './pages/OAuthRoleSelect';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Role Dashboard Views
import CompanyDashboardView from './pages/CompanyDashboardView';
import CompanyProfilePage from './pages/CompanyProfilePage';
import CompanyOpportunitiesPage from './pages/CompanyOpportunitiesPage';
import CompanyApplicantsPage from './pages/CompanyApplicantsPage';
import CompanyStudentSearchPage from './pages/CompanyStudentSearchPage';
import CompanyShortlistedPage from './pages/CompanyShortlistedPage';
import CompanyInterviewsPage from './pages/CompanyInterviewsPage';
import CompanyRecommendedCandidatesPage from './pages/CompanyRecommendedCandidatesPage';
import CompanySkillInsightsPage from './pages/CompanySkillInsightsPage';
import CompanyNotificationsPage from './pages/CompanyNotificationsPage';
import CollegeDashboardView from './pages/CollegeDashboardView';
import FacultyStudentsPage from './pages/FacultyStudentsPage';
import FacultySkillAnalyticsPage from './pages/FacultySkillAnalyticsPage';
import FacultySkillGapPage from './pages/FacultySkillGapPage';
import FacultyOpportunitiesPage from './pages/FacultyOpportunitiesPage';
import FacultyPlacementPage from './pages/FacultyPlacementPage';
import FacultyNotificationsPage from './pages/FacultyNotificationsPage';
import FacultySettingsPage from './pages/FacultySettingsPage';
import AdminDashboardView from './pages/AdminDashboardView';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import AdminOpportunitiesPage from './pages/AdminOpportunitiesPage';
import AdminAssessmentsPage from './pages/AdminAssessmentsPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminPlacementsPage from './pages/AdminPlacementsPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';

// Consolidated Student Portal Pages
import StudentDashboardView from './pages/StudentDashboardView';
import StudentProfilePage from './pages/StudentProfilePage';
import SkillsAssessmentPage from './pages/SkillsAssessmentPage';
import SkillGapPage from './pages/SkillGapPage';
import CompanyPrepPage from './pages/CompanyPrepPage';
import OpportunityDiscoveryPage from './pages/OpportunityDiscoveryPage';
import StudentApplicationsPage from './pages/StudentApplicationsPage';
import StudentInterviewsPage from './pages/StudentInterviewsPage';
import StudentNotificationsPage from './pages/StudentNotificationsPage';
import StudentSettingsPage from './pages/StudentSettingsPage';

function NotificationsRoleRouter() {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  if (role === 'admin') {
    return <AdminNotificationsPage />;
  }
  if (role === 'company') {
    return <CompanyNotificationsPage />;
  }
  if (['faculty', 'institution', 'academician'].includes(role)) {
    return <FacultyNotificationsPage />;
  }
  return <StudentNotificationsPage />;
}

function SettingsRoleRouter() {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  if (['faculty', 'institution', 'academician'].includes(role)) {
    return <FacultySettingsPage />;
  }
  return <StudentSettingsPage />;
}

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

  // OAuth callback pages — full viewport, no navbar/footer
  if (location.pathname === '/auth/callback' || location.pathname === '/auth/oauth/role') {
    return (
      <Routes>
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/auth/oauth/role" element={<OAuthRoleSelect />} />
      </Routes>
    );
  }

  // Public standalone pages (when not logged in)
  const isPublicPage = ['/login', '/register', '/forgot-password', '/how-it-works', '/about'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  if (!user && (isPublicPage || isHomePage)) {
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
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        )}
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

  // Dashboard & Authenticated Application Workspace (or unauthenticated visits to protected routes -> redirects via ProtectedRoute to /login)
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* ══════════════ 1. CONSOLIDATED 9 STUDENT PORTAL ROUTES ══════════════ */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboardView onNavigate={(view) => navigate(`/${view}`)} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/skills" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SkillsAssessmentPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/assessment" element={<Navigate to="/skills" replace />} />
        <Route 
          path="/skill-gap" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SkillGapPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/skill-dna" element={<Navigate to="/skill-gap" replace />} />
        <Route path="/industry-demand" element={<Navigate to="/skill-gap" replace />} />
        <Route 
          path="/company-prep" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CompanyPrepPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/company-prep/topics" element={<Navigate to="/company-prep" replace />} />
        <Route path="/company-prep/learning" element={<Navigate to="/company-prep" replace />} />
        <Route path="/company-prep/practice" element={<Navigate to="/company-prep" replace />} />
        <Route path="/company-prep/mock-test" element={<Navigate to="/company-prep" replace />} />
        <Route 
          path="/opportunities" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <OpportunityDiscoveryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/applications" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentApplicationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/interviews" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentInterviewsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty', 'company', 'admin', 'institution', 'academician']}>
              <NotificationsRoleRouter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty', 'company', 'admin', 'institution', 'academician']}>
              <SettingsRoleRouter />
            </ProtectedRoute>
          } 
        />

        {/* ══════════════ FACULTY & INSTITUTION PORTAL ROUTES ══════════════ */}
        <Route 
          path="/faculty" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <CollegeDashboardView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/students" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultyStudentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/skills" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultySkillAnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/faculty/skill-analytics" element={<Navigate to="/faculty/skills" replace />} />
        <Route 
          path="/faculty/skill-gap" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultySkillGapPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/opportunities" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultyOpportunitiesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/placement" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultyPlacementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/notifications" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultyNotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/network" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultyStudentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/reports" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultySkillGapPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty/settings" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <FacultySettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/institution" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'institution', 'academician']}>
              <CollegeDashboardView />
            </ProtectedRoute>
          } 
        />

        {/* ══════════════ COMPANY PORTAL ROUTES ══════════════ */}
        <Route 
          path="/company" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyDashboardView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/profile" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/opportunities" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyOpportunitiesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/applicants" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyApplicantsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/recommended-candidates" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyRecommendedCandidatesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/students" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyStudentSearchPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/skill-insights" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanySkillInsightsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/shortlisted" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyShortlistedPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/interviews" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyInterviewsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/notifications" 
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyNotificationsPage />
            </ProtectedRoute>
          } 
        />

        {/* ══════════════ ADMIN PORTAL ROUTES ══════════════ */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/companies" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCompaniesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/opportunities" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOpportunitiesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/assessments" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAssessmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/applications" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminApplicationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/placements" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPlacementsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/notifications" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminNotificationsPage />
            </ProtectedRoute>
          } 
        />

        {/* Design System */}
        <Route path="/design-system" element={<DesignSystemShowcase />} />

        {/* Public Fallback routes if navigated from within Dashboard */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* 404 Not Found Fallback */}
        <Route path="/error" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </DashboardLayout>
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
