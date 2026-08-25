import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileForm from './components/ProfileForm';
import CompanyProfileForm from './components/CompanyProfileForm';
import OpportunityForm from './components/OpportunityForm';
import StudentOpportunities from './pages/StudentOpportunities';
import RecruiterApplicants from './components/RecruiterApplicants';
import { 
  Shield, Users, Briefcase, GraduationCap, Building2, 
  Activity, Database, Server, RefreshCw, LogOut, LogIn, UserPlus,
  Award, FileText
} from 'lucide-react';

// Common Home Page displaying Integration Health & User session summary
function DashboardSelector() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {user ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                Logged In as {user.role}
              </span>
              <h2 className="text-2xl font-black text-white mt-3">Welcome back, {user.name}!</h2>
              <p className="text-slate-400 text-sm mt-1">Email: {user.email} | Status: <span className="text-emerald-400 font-semibold">{user.status}</span></p>
            </div>
            <button
              onClick={() => navigate(`/${user.role}`)}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition duration-150 text-sm cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
            >
              <span>Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center shadow-lg">
          <p className="text-slate-400 text-sm">Please log in or register to view role-based dashboards.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link to="/login" className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            <Link to="/register" className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Home() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err.message || "Failed to connect to the backend server.");
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, [refreshCount]);

  return (
    <div className="space-y-12">
      {/* Intro Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Connecting Academia, Students & Industry
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Smart India Hackathon 2026 portal for mapped credentials, weighted skill matches, placements, and role authorizations.
        </p>
      </div>

      <DashboardSelector />

      {/* Integration Status Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/30 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <span>Portal Core Connectivity Health Status</span>
          </h2>
          <button 
            onClick={() => setRefreshCount(prev => prev + 1)}
            className="text-slate-400 hover:text-white p-1 rounded-lg border border-slate-800 hover:bg-slate-850 cursor-pointer transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Backend Connectivity Card */}
          <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-5 flex flex-col justify-between shadow-inner">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-slate-400 text-sm font-semibold">Backend API Server</h3>
                <p className="text-xs text-slate-500 mt-0.5">Express.js (Port 5050)</p>
              </div>
              <div className={`p-2 rounded-lg ${error ? 'bg-red-500/10 text-red-400' : loading ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <Server className="h-5 w-5" />
              </div>
            </div>
            <div>
              {error ? (
                <div className="flex items-center space-x-2 text-red-500 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>DISCONNECTED</span>
                </div>
              ) : loading ? (
                <div className="flex items-center space-x-2 text-amber-500 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>CHECKING...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>RUNNING (UP)</span>
                </div>
              )}
            </div>
          </div>

          {/* Database Connectivity Card */}
          <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-5 flex flex-col justify-between shadow-inner">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-slate-400 text-sm font-semibold">Database Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">MongoDB Mongoose</p>
              </div>
              <div className={`p-2 rounded-lg ${error || (healthData && healthData.database !== 'CONNECTED') ? 'bg-red-500/10 text-red-400' : loading ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <Database className="h-5 w-5" />
              </div>
            </div>
            <div>
              {error ? (
                <div className="flex items-center space-x-2 text-red-500 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span>DISCONNECTED</span>
                </div>
              ) : loading ? (
                <div className="flex items-center space-x-2 text-amber-500 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>CHECKING...</span>
                </div>
              ) : healthData && healthData.database === 'CONNECTED' ? (
                <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>CONNECTED</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-500 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span>DISCONNECTED</span>
                </div>
              )}
            </div>
          </div>

          {/* System Uptime & Latency */}
          <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-5 flex flex-col justify-between shadow-inner">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-slate-400 text-sm font-semibold">API Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Uptime Metrics</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div>
              {error ? (
                <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  Connection Refused
                </span>
              ) : loading ? (
                <span className="text-xs text-slate-500">Loading system metrics...</span>
              ) : healthData ? (
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Server Uptime:</span>
                    <span className="font-semibold text-indigo-300">{Math.round(healthData.uptime)} seconds</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500">No active connection.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate Student Profile Completion Percentage
const calculateCompletion = (profile) => {
  if (!profile) return 0;
  let score = 0;
  
  if (profile.userId?.name) score += 15;
  
  const acad = profile.academicInformation;
  if (acad) {
    if (acad.college) score += 5;
    if (acad.degree) score += 5;
    if (acad.branch) score += 5;
    if (acad.year) score += 5;
    if (acad.cgpa) score += 5;
  }
  
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.softSkills && profile.softSkills.length > 0) score += 10;
  if (profile.projects && profile.projects.length > 0) score += 15;
  if (profile.certifications && profile.certifications.length > 0) score += 10;
  if (profile.resumeUrl) score += 10;
  
  return score;
};

// Role Dashboard Placeholder views
function StudentDashboard() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await fetch('/api/applications/student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications list:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/students/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch student profile.');
      }
      setProfile(data.profile);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchApplications();
    }
  }, [token]);

  const handleSaveSuccess = (updatedProfile) => {
    setProfile(updatedProfile);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <p className="text-sm">Loading Student Profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/35 p-6 rounded-2xl text-center space-y-3 max-w-lg mx-auto">
        <p className="text-red-400 font-semibold">Error Loading Profile</p>
        <p className="text-xs text-slate-400 font-mono">{error}</p>
        <button onClick={fetchProfile} className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
          Retry Fetching
        </button>
      </div>
    );
  }

  const completion = calculateCompletion(profile);

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Student Hub Dashboard</h2>
            <p className="text-slate-400 text-xs mt-0.5">Manage your credentials, assess skill gaps, and apply to matches.</p>
          </div>
        </div>

        <button
          onClick={() => setEditMode(!editMode)}
          className={`font-bold px-5 py-2.5 rounded-xl transition duration-150 text-xs shadow-sm flex items-center justify-center space-x-2 cursor-pointer ${editMode ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
          <span>{editMode ? 'Back to Overview' : 'Edit Profile Details'}</span>
        </button>
      </div>

      {editMode ? (
        <ProfileForm 
          initialProfile={profile} 
          token={token} 
          onSaveSuccess={handleSaveSuccess} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns - Main Profile Views */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Information Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span>Academic Overview</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 text-xs block">College</span>
                  <span className="text-slate-200 font-semibold">{profile?.academicInformation?.college || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Degree</span>
                  <span className="text-slate-200 font-semibold">{profile?.academicInformation?.degree || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Branch / Specialization</span>
                  <span className="text-slate-200 font-semibold">{profile?.academicInformation?.branch || 'Not specified'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-xs block">Year</span>
                    <span className="text-slate-200 font-semibold">{profile?.academicInformation?.year || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">CGPA</span>
                    <span className="text-slate-200 font-semibold">{profile?.academicInformation?.cgpa ? `${profile.academicInformation.cgpa}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Skills and Soft Skills */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 border-b border-slate-800 pb-2 flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  <span>Technical Skills</span>
                </h3>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-full text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No technical skills added yet. Click "Edit Profile Details" to add skills.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 border-b border-slate-800 pb-2 flex items-center space-x-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <span>Soft Skills</span>
                </h3>
                {profile?.softSkills && profile.softSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.softSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-850 border border-slate-800 text-slate-300 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No soft skills added.</p>
                )}
              </div>
            </div>

            {/* Projects List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <span>Featured Projects ({profile?.projects?.length || 0})</span>
              </h3>
              {profile?.projects && profile.projects.length > 0 ? (
                <div className="space-y-4">
                  {profile.projects.map((proj, i) => (
                    <div key={i} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                            View Project
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.technologies.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-850 text-slate-400 rounded text-[10px] font-semibold border border-slate-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-505 italic text-center py-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                  No projects listed.
                </p>
              )}
            </div>

            {/* Certifications List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Award className="h-4 w-4 text-indigo-400" />
                <span>Certifications ({profile?.certifications?.length || 0})</span>
              </h3>
              {profile?.certifications && profile.certifications.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.certifications.map((cert, i) => (
                    <div key={i} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <h4 className="font-bold text-white text-sm">{cert.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{cert.issuer}</p>
                      {cert.date && <p className="text-[10px] text-slate-500 mt-0.5">Earned: {cert.date}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-505 italic text-center py-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                  No certifications listed.
                </p>
              )}
            </div>

            {/* Placements Application Status Tracker */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <span>My Placement Applications ({applications.length})</span>
              </h3>
              {loadingApplications ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                </div>
              ) : applications.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                  You haven't submitted any applications yet. Explore openings in the "Explore Placements" tab to apply!
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const opp = app.opportunityId;
                    const comp = opp?.companyId;
                    return (
                      <div key={app._id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">{opp?.title || 'Unknown Position'}</h4>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                            <span className="font-extrabold text-slate-350">{comp?.companyName || 'Unknown Company'}</span>
                            <span>•</span>
                            <span className="capitalize">{opp?.type}</span>
                            <span>•</span>
                            <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          {app.resumeUrl && (
                            <a 
                              href={app.resumeUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] text-slate-450 hover:text-slate-300 underline"
                            >
                              Resume Link
                            </a>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            app.status === 'accepted' 
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                              : app.status === 'rejected' 
                              ? 'bg-red-500/10 border-red-500/35 text-red-400' 
                              : app.status === 'shortlisted' 
                              ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-400'
                              : app.status === 'reviewed'
                              ? 'bg-blue-500/10 border-blue-500/35 text-blue-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Columns - Sidebar (Completion Metrics & Resume Link) */}
          <div className="space-y-6">
            {/* Profile Completion Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                Profile Completion
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Onboarding Progress</span>
                  <span className="text-sm font-extrabold text-indigo-400">{completion}%</span>
                </div>
                <div className="w-full bg-slate-850 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>

                {/* Progress Checklist */}
                <div className="pt-4 border-t border-slate-850 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={profile?.userId?.name ? 'text-indigo-400 font-bold' : 'text-slate-550'}>
                      {profile?.userId?.name ? '✓' : '○'}
                    </span>
                    <span className="text-slate-300">Personal Details (15%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={profile?.academicInformation?.college && profile?.academicInformation?.degree ? 'text-indigo-400 font-bold' : 'text-slate-550'}>
                      {profile?.academicInformation?.college && profile?.academicInformation?.degree ? '✓' : '○'}
                    </span>
                    <span className="text-slate-300">Academic Records (25%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={profile?.skills && profile.skills.length > 0 ? 'text-indigo-400 font-bold' : 'text-slate-550'}>
                      {profile?.skills && profile.skills.length > 0 ? '✓' : '○'}
                    </span>
                    <span className="text-slate-300">Technical Skills (15%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={profile?.softSkills && profile.softSkills.length > 0 ? 'text-indigo-400 font-bold' : 'text-slate-550'}>
                      {profile?.softSkills && profile.softSkills.length > 0 ? '✓' : '○'}
                    </span>
                    <span className="text-slate-300">Soft Skills (10%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={profile?.projects && profile.projects.length > 0 ? 'text-indigo-400 font-bold' : 'text-slate-550'}>
                      {profile?.projects && profile.projects.length > 0 ? '✓' : '○'}
                    </span>
                    <span className="text-slate-300">Projects (15%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={profile?.certifications && profile.certifications.length > 0 ? 'text-indigo-400 font-bold' : 'text-slate-550'}>
                      {profile?.certifications && profile.certifications.length > 0 ? '✓' : '○'}
                    </span>
                    <span className="text-slate-300">Certifications (10%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={profile?.resumeUrl ? 'text-indigo-400 font-bold' : 'text-slate-550'}>
                      {profile?.resumeUrl ? '✓' : '○'}
                    </span>
                    <span className="text-slate-300">Public Resume Link (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Link Widget */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Resume Reference</span>
              </h3>
              {profile?.resumeUrl ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Your resume document is referenced at:</p>
                  <a 
                    href={profile.resumeUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-slate-700 hover:border-slate-650 bg-slate-855 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs transition duration-150 cursor-pointer shadow-inner"
                  >
                    <span>View Public Resume File</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 italic">No resume referenced yet.</p>
                  <button 
                    onClick={() => setEditMode(true)}
                    className="w-full text-center text-xs font-semibold text-indigo-400 hover:text-indigo-305 py-1 transition cursor-pointer"
                  >
                    Add Resume Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function CompanyDashboard() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [postMode, setPostMode] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [viewApplicantsOpp, setViewApplicantsOpp] = useState(null);

  const fetchProfileAndPostings = async () => {
    setLoading(true);
    setError('');
    try {
      const profResponse = await fetch('/api/companies/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const profData = await profResponse.json();
      if (!profResponse.ok) {
        throw new Error(profData.message || 'Failed to fetch company profile.');
      }
      setProfile(profData.profile);

      const postResponse = await fetch('/api/opportunities/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const postData = await postResponse.json();
      if (!postResponse.ok) {
        throw new Error(postData.message || 'Failed to fetch postings.');
      }
      setPostings(postData.opportunities || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching company operations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileAndPostings();
    }
  }, [token]);

  const handleSaveSuccess = (updatedProfile) => {
    setProfile(updatedProfile);
    setEditMode(false);
  };

  const handlePostSuccess = () => {
    setPostMode(false);
    setEditingOpp(null);
    fetchProfileAndPostings();
  };

  const handleDeleteOpp = async (oppId) => {
    if (!window.confirm('Are you sure you want to remove this opportunity posting?')) return;
    try {
      const response = await fetch(`/api/opportunities/${oppId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete posting.');
      }
      fetchProfileAndPostings();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="text-sm">Loading Corporate Hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/35 p-6 rounded-2xl text-center space-y-3 max-w-lg mx-auto">
        <p className="text-red-400 font-semibold">Error Loading Hub</p>
        <p className="text-xs text-slate-400 font-mono">{error}</p>
        <button onClick={fetchProfileAndPostings} className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
          Retry Fetching
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Company Operations Hub</h2>
            <p className="text-slate-400 text-xs mt-0.5">Manage your corporate credentials, recruitment pipelines, and post openings.</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {(!editMode && !postMode && !editingOpp && !viewApplicantsOpp) && (
            <button
              onClick={() => {
                if (profile?.verificationStatus !== 'verified') {
                  alert('Verification Pending: You will be able to post opportunities once portal administrators verify your organization.');
                  return;
                }
                setPostMode(true);
              }}
              className="font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition duration-150 text-xs shadow-sm cursor-pointer"
            >
              Post Opportunity
            </button>
          )}

          <button
            onClick={() => {
              setEditMode(!editMode);
              setPostMode(false);
              setEditingOpp(null);
              setViewApplicantsOpp(null);
            }}
            className={`font-bold px-5 py-2.5 rounded-xl transition duration-150 text-xs shadow-sm flex items-center justify-center space-x-2 cursor-pointer ${editMode ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700' : 'bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300'}`}
          >
            <span>{editMode ? 'Back to Hub' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {editMode ? (
        <CompanyProfileForm 
          initialProfile={profile} 
          token={token} 
          onSaveSuccess={handleSaveSuccess} 
        />
      ) : postMode || editingOpp ? (
        <OpportunityForm 
          opportunity={editingOpp}
          token={token}
          onSaveSuccess={handlePostSuccess}
          onCancel={() => {
            setPostMode(false);
            setEditingOpp(null);
          }}
        />
      ) : viewApplicantsOpp ? (
        <RecruiterApplicants 
          opportunity={viewApplicantsOpp}
          token={token}
          onBack={() => {
            setViewApplicantsOpp(null);
            fetchProfileAndPostings();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile view */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              <div>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
                  {profile?.industry || 'Industry Sector Not Set'}
                </span>
                <h3 className="text-2xl font-black text-white mt-3">{profile?.companyName}</h3>
                {profile?.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-indigo-400 hover:underline mt-1 inline-block"
                  >
                    {profile.website}
                  </a>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About the Company</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {profile?.description || 'No description provided. Click "Edit Profile" to tell students about your organization, work culture, and domain.'}
                </p>
              </div>
            </div>

            {/* Opportunities list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Active Corporate Postings ({postings.length})
              </h3>
              {postings.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-xl">
                  {profile?.verificationStatus === 'verified'
                    ? 'No placements listed yet. Click "Post Opportunity" to register your first job/internship openings.'
                    : 'Once verified, you will be able to post internships and full-time job openings for matching student recommendations.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {postings.map((opp) => (
                    <div key={opp._id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${opp.type === 'job' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {opp.type}
                          </span>
                          <h4 className="font-bold text-white text-sm mt-1">{opp.title}</h4>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewApplicantsOpp(opp)}
                            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded text-[10px] font-semibold border border-indigo-500/20 cursor-pointer animate-pulse"
                          >
                            Applicants
                          </button>
                          <button
                            onClick={() => setEditingOpp(opp)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] font-semibold border border-slate-705 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOpp(opp._id)}
                            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[10px] font-semibold border border-red-500/20 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-b border-slate-900/60 py-2">
                        <div>Location: <span className="text-slate-200">{opp.location}</span></div>
                        <div>Stipend: <span className="text-slate-200">{opp.stipend}</span></div>
                        {opp.type === 'internship' && <div>Duration: <span className="text-slate-200">{opp.duration}</span></div>}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {opp.requiredSkills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-850 rounded text-[9px] font-mono">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Verification status & contacts */}
          <div className="space-y-6">
            {/* Verification Widget */}
            <div className="bg-slate-900 border border-slate-855 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Verification Credentials
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Account Status:</span>
                {profile?.verificationStatus === 'verified' ? (
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 rounded-full text-xs font-bold uppercase">
                    Verified
                  </span>
                ) : profile?.verificationStatus === 'rejected' ? (
                  <span className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/35 text-red-400 rounded-full text-xs font-bold uppercase">
                    Rejected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/35 text-amber-400 rounded-full text-xs font-bold uppercase animate-pulse">
                    Pending Approval
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-505 leading-relaxed">
                {profile?.verificationStatus === 'verified' 
                  ? 'Your industry credentials have been successfully reviewed and verified by SIH portal administrators. You have full access to recruit candidates.' 
                  : 'Pending Verification: Portal administrators are reviewing your registration. You can still set up your profile, but posting opportunities will be available after verification approval.'}
              </p>
            </div>

            {/* Corporate Contacts Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Corporate Contacts
              </h3>
              <div className="text-xs text-slate-405 space-y-3">
                <div>
                  <span className="text-slate-550 block">Headquarters Location</span>
                  <span className="text-slate-200 font-semibold">{profile?.location || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-550 block">Recruitment Email Address</span>
                  <span className="text-slate-200 font-semibold">{profile?.contactEmail || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-550 block">Contact Phone Number</span>
                  <span className="text-slate-200 font-semibold">{profile?.contactPhone || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AcademicianDashboard() {
  const { token, user } = useAuth();
  const [fdps, setFdps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAcademicOpportunities = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/opportunities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch academic listings.');
      }
      
      const allOpps = data.opportunities || [];
      setFdps(allOpps.filter(o => o.type === 'fdp'));
      setProjects(allOpps.filter(o => o.type === 'research'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading collaborative listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAcademicOpportunities();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <p className="text-sm">Loading Collaboration Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/35 p-6 rounded-2xl text-center space-y-3 max-w-lg mx-auto">
        <p className="text-red-400 font-semibold">Error Loading Opportunities</p>
        <p className="text-xs text-slate-400 font-mono">{error}</p>
        <button onClick={fetchAcademicOpportunities} className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Overview Hub banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Academician Collaboration Hub</h2>
            <p className="text-slate-400 text-xs mt-0.5">Welcome, {user?.name || 'Faculty Member'}. Explore professional Faculty Development Programmes and industry collaborative research consultancies.</p>
          </div>
        </div>
      </div>

      {/* Grid splits FDP vs Research */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FDP Section */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
            <GraduationCap className="h-4.5 w-4.5 text-pink-400" />
            <span>Faculty Development Programmes ({fdps.length})</span>
          </h3>

          {fdps.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
              No FDP postings listed on the portal yet.
            </p>
          ) : (
            <div className="space-y-4">
              {fdps.map((opp) => (
                <div key={opp._id} className="bg-slate-905 border border-slate-800 rounded-xl p-5 hover:border-slate-750 transition duration-150 space-y-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                      Duration: {opp.duration || 'Flexible'}
                    </span>
                    <h4 className="font-extrabold text-white text-sm mt-2">{opp.title}</h4>
                    <p className="text-xs text-slate-400 font-extrabold mt-0.5">{opp.companyId?.companyName}</p>
                  </div>

                  <p className="text-slate-350 text-xs leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {opp.requiredSkills.map((sk, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-850 text-slate-400 border border-slate-800 rounded text-[9px] font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs gap-3">
                    <span className="text-slate-500 text-[10px]">Location: {opp.location}</span>
                    <a 
                      href={`mailto:${opp.companyId?.contactEmail || 'recruiter@sih.in'}?subject=Inquiry regarding Faculty Development: ${opp.title}`}
                      className="flex items-center space-x-1.5 py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-[10px] shadow-sm cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Inquire FDP</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industry Collaborative Research Consultancy Section */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Building2 className="h-4.5 w-4.5 text-indigo-400" />
            <span>Consultancy & Research Projects ({projects.length})</span>
          </h3>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
              No consultancy or research projects listed yet.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((opp) => (
                <div key={opp._id} className="bg-slate-905 border border-slate-800 rounded-xl p-5 hover:border-slate-750 transition duration-150 space-y-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Funding / Grant: {opp.stipend || 'Competitive'}
                    </span>
                    <h4 className="font-extrabold text-white text-sm mt-2">{opp.title}</h4>
                    <p className="text-xs text-slate-400 font-extrabold mt-0.5">{opp.companyId?.companyName}</p>
                  </div>

                  <p className="text-slate-350 text-xs leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {opp.requiredSkills.map((sk, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-850 text-slate-400 border border-slate-800 rounded text-[9px] font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs gap-3">
                    <span className="text-slate-500 text-[10px]">Timeline: {opp.duration || 'Flexible'}</span>
                    <a 
                      href={`mailto:${opp.companyId?.contactEmail || 'recruiter@sih.in'}?subject=Consultancy Collaboration Proposal: ${opp.title}`}
                      className="flex items-center space-x-1.5 py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-[10px] shadow-sm cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Submit Proposal</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function InstitutionDashboard() {
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/institutions/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch institutional analytics.');
      }
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while loading analytics records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <p className="text-sm">Loading Institutional Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/35 p-6 rounded-2xl text-center space-y-3 max-w-lg mx-auto">
        <p className="text-red-400 font-semibold">Error Loading Analytics</p>
        <p className="text-xs text-slate-400 font-mono">{error}</p>
        <button onClick={fetchAnalytics} className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
          Retry Loading
        </button>
      </div>
    );
  }

  const metrics = analytics?.metrics || {};
  const studentsList = analytics?.studentsList || [];

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{analytics?.college || 'Educational Institution'}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Welcome, {user?.name || 'Administrator'}. Monitor student placement readiness, active applications, and skill metrics.</p>
          </div>
        </div>
      </div>

      {/* Grid: Placement Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Candidates</span>
          <h3 className="text-3xl font-black text-white">{metrics.totalStudents}</h3>
          <p className="text-[10px] text-slate-400">Registered students on profile</p>
        </div>

        {/* Placement Rate Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Placement Rate</span>
          <h3 className="text-3xl font-black text-emerald-400">{metrics.placementRate}%</h3>
          <p className="text-[10px] text-slate-400">{metrics.placedStudents} Placed candidates</p>
        </div>

        {/* Average CGPA Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Average CGPA</span>
          <h3 className="text-3xl font-black text-indigo-400">{metrics.averageCgpa} / 10</h3>
          <p className="text-[10px] text-slate-400">Aggregate academic performance</p>
        </div>

        {/* Active Applications Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Submissions</span>
          <h3 className="text-3xl font-black text-purple-400">{metrics.activeApplications}</h3>
          <p className="text-[10px] text-slate-400">Submitted placement requests</p>
        </div>
      </div>

      {/* Split Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Candidates Registry */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Institutional Candidates Directory ({studentsList.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Academic Stats</th>
                  <th className="py-2.5 px-3">Skills</th>
                  <th className="py-2.5 px-3 text-right">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {studentsList.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-950/20 transition duration-70">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{s.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>CGPA: <strong className="text-slate-200">{s.cgpa ? s.cgpa : 'N/A'}</strong></div>
                      <div className="text-[10px] text-slate-450">Study Year: {s.year}</div>
                    </td>
                    <td className="py-3 px-3 max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {s.skills && s.skills.length > 0 ? (
                          s.skills.slice(0, 3).map((sk, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-850 text-slate-400 rounded text-[9px] border border-slate-800">
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600 italic text-[10px]">No skills</span>
                        )}
                        {s.skills.length > 3 && (
                          <span className="text-[9px] text-slate-500">+{s.skills.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {s.placementStatus === 'placed' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold uppercase text-[9px]">
                          Placed
                        </span>
                      ) : s.placementStatus === 'active_applicant' ? (
                        <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full font-bold uppercase text-[9px]">
                          Active Applicant
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-full font-bold uppercase text-[9px]">
                          Not Applied
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Skill Frequency Distributions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Skill Frequency Distribution
          </h3>
          {metrics.skillFrequency && metrics.skillFrequency.length > 0 ? (
            <div className="space-y-4 pt-2">
              {metrics.skillFrequency.map((item, idx) => (
                <div key={idx} className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{item.skill}</span>
                    <span className="text-slate-450 font-mono text-[10px]">{item.count} student{item.count > 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((item.count / metrics.totalStudents) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-10">
              No technical skills listed by matched students yet. Distribution frequencies will show up as profiles update.
            </p>
          )}
        </div>

      </div>

    </div>
  );
}

function AdminDashboard() {
  const { token, user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/companies/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch companies list');
      }
      setCompanies(data.companies || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading companies catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCompanies();
    }
  }, [token]);

  const handleVerify = async (companyId, newStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/companies/admin/${companyId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update company verification status');
      }
      
      // Update state locally
      setCompanies(prev => 
        prev.map(c => c._id === companyId ? { ...c, verificationStatus: newStatus } : c)
      );
      setSuccessMsg(`Company status successfully updated to: ${newStatus}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview stats header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Platform Administrator Hub</h2>
            <p className="text-slate-400 text-xs mt-0.5">Welcome, {user?.name || 'Admin'}. Monitor corporate onboarding and approve verified profiles.</p>
          </div>
        </div>
      </div>

      {/* Main verification console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6 animate-in fade-in duration-200 delay-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Corporate Moderation Panel</h3>
          <button 
            onClick={fetchCompanies}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-350 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Refresh List</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-amber-500"></div>
            <p className="text-xs">Fetching company registries...</p>
          </div>
        ) : companies.length === 0 ? (
          <p className="text-xs text-slate-550 italic text-center py-8">
            No registered company accounts found on the system.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Industry Sector</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-950/20 transition duration-100">
                    <td className="py-4 px-4 font-bold text-white">
                      <div>{c.companyName}</div>
                      {c.website && (
                        <a 
                          href={c.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-indigo-455 hover:underline font-mono mt-0.5 block"
                        >
                          {c.website}
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {c.industry || <span className="text-slate-600 italic">Not set</span>}
                    </td>
                    <td className="py-4 px-4 text-slate-400 space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-350">{c.contactEmail || c.userId?.email}</span>
                      </div>
                      {c.contactPhone && <div className="text-[10px] font-mono text-slate-500">{c.contactPhone}</div>}
                    </td>
                    <td className="py-4 px-4">
                      {c.verificationStatus === 'verified' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold uppercase text-[9px]">
                          Verified
                        </span>
                      ) : c.verificationStatus === 'rejected' ? (
                        <span className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full font-bold uppercase text-[9px]">
                          Rejected
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full font-bold uppercase text-[9px] animate-pulse">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      {c.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleVerify(c._id, 'verified')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer text-[10px]"
                        >
                          Approve
                        </button>
                      )}
                      {c.verificationStatus !== 'rejected' && (
                        <button
                          onClick={() => handleVerify(c._id, 'rejected')}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-405 font-bold px-3.5 py-1.5 rounded-xl border border-red-500/25 transition cursor-pointer text-[10px]"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Inner layouts with header
function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90">
            <div className="bg-indigo-600 p-2 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                SIH26044
              </span>
              <span className="text-slate-500 text-xs block -mt-1 font-medium">Academia-Industry Portal</span>
            </div>
          </Link>

          <div className="flex items-center space-x-5">
            {user && (
              <nav className="hidden sm:flex items-center space-x-4 mr-2">
                <Link to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : user.role === 'academician' ? '/academician' : user.role === 'institution' ? '/institution' : '/admin'} className="text-xs font-bold text-slate-400 hover:text-slate-200 transition">
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <Link to="/opportunities" className="text-xs font-bold text-slate-400 hover:text-slate-200 transition">
                    Explore Placements
                  </Link>
                )}
              </nav>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                  <span className="text-xs text-indigo-400 uppercase font-bold tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-850 text-slate-300 px-3.5 py-2 rounded-xl border border-slate-800 transition text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-600/10">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Context Wrapper */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Protected Role Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/opportunities" element={<StudentOpportunities />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/company" element={<CompanyDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['academician']} />}>
            <Route path="/academician" element={<AcademicianDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['institution']} />}>
            <Route path="/institution" element={<InstitutionDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-900/60 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p>© 2026 Smart India Hackathon Project (SIH26044).</p>
          <p className="text-indigo-400/60 font-medium">Phase 2: Authentication Engine Active</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public guest routes (outside main frame) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main system routes */}
          <Route path="*" element={<MainLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
