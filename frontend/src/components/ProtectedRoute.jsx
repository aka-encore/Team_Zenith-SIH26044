import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';


const ROLE_REDIRECTS = {
  student: '/student',
  faculty: '/faculty',
  academician: '/faculty',
  institution: '/faculty',
  company: '/company',
  admin: '/admin'
};


const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Validating role & session...</span>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization with alias support
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toLowerCase();
    
    // Normalize aliases
    const expandedRoles = allowedRoles.flatMap(r => {
      if (r === 'faculty' || r === 'institution' || r === 'academician') {
        return ['faculty', 'institution', 'academician'];
      }
      return [r];
    });

    if (!expandedRoles.includes(userRole)) {
      const targetDashboard = ROLE_REDIRECTS[userRole] || '/student';
      return <Navigate to={targetDashboard} replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
