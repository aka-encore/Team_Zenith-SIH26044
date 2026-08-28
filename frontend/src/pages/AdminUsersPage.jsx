import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Search, Filter, RefreshCw, AlertCircle, 
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck, 
  Check, X, Eye, ShieldAlert, GraduationCap, School, 
  Building2, Lock, Sparkles, ChevronRight, UserCheck, 
  UserX, Mail, Calendar, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUsersPage() {
  const { token, user: currentAdmin } = useAuth();

  // Data & Status State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Viewing User Profile
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [modalExtraDetails, setModalExtraDetails] = useState(null);

  // Status Updating State
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch Users from MongoDB
  const fetchUsers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve user accounts.');
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error('Admin Users fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to user management service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchUsers();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle user active / inactive status
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUpdatingId(userId);
    setActionSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update user status.');
      }

      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }

      setActionSuccessMsg(`User status successfully changed to "${newStatus}".`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Status update error:', err);
      setErrorMsg(err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // View User Inspection Modal
  const handleInspectUser = async (u) => {
    setSelectedUser(u);
    setModalExtraDetails(null);
    setUserModalOpen(true);
    setLoadingUserDetails(true);

    try {
      const response = await fetch(`/api/admin/users/${u._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setModalExtraDetails(data.extraDetails);
      }
    } catch (err) {
      console.error('Error loading extra user details:', err);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return { label: 'Student', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: GraduationCap };
      case 'faculty':
      case 'institution':
      case 'academician':
        return { label: 'Faculty', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: School };
      case 'company':
        return { label: 'Company', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: Building2 };
      case 'admin':
        return { label: 'Admin', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: Shield };
      default:
        return { label: role, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', icon: Users };
    }
  };

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/admin" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Command Center</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Users className="h-7 w-7 text-blue-500" />
            <span>Platform User Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, inspect, activate, or deactivate accounts across Student, Faculty, Employer, and Admin roles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Users"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & FILTERS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* General Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by full name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Account Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty & Institutions</option>
              <option value="company">Employer Companies</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Inactive / Suspended</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>

        </div>

        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {users.length} Users Matching Criteria
            </span>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ USERS TABLE ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Registered User Accounts</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live records from MongoDB with instant account activation controls
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total {users.length} Records
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-blue-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p>No user accounts found matching your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">User Details</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {users.map(u => {
                  const roleMeta = getRoleBadge(u.role);
                  const RoleIcon = roleMeta.icon;
                  const createdDate = u.createdAt ? new Date(u.createdAt) : null;
                  const isUpdating = updatingId === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      
                      {/* Name & Email */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm shrink-0 overflow-hidden">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {u.name}
                            </span>
                            <span className="text-slate-400 text-[11px] font-mono block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1.5 border ${roleMeta.color}`}>
                          <RoleIcon className="h-3 w-3" />
                          <span>{roleMeta.label}</span>
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : u.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          ● {u.status || 'active'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                        {createdDate ? createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-2">
                        
                        {/* View User Modal Trigger */}
                        <button
                          onClick={() => handleInspectUser(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>

                        {/* Activate / Deactivate Toggle */}
                        {u.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status)}
                            disabled={isUpdating || u._id === currentAdmin?.id}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Deactivate Account"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            <span>{isUpdating ? 'Updating...' : 'Deactivate'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Activate Account"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>{isUpdating ? 'Updating...' : 'Activate'}</span>
                          </button>
                        )}

                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ USER INSPECTION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {userModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedUser.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Role</span>
                <span className="font-extrabold text-slate-900 dark:text-white capitalize">{selectedUser.role}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Status</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase font-mono">{selectedUser.status || 'Active'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Verification</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {selectedUser.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Registration Date</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Linked Role Profile Metadata */}
            {loadingUserDetails ? (
              <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                <span>Loading Linked Profile Data...</span>
              </div>
            ) : modalExtraDetails ? (
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>Linked Profile Telemetry</span>
                </h4>

                {selectedUser.role === 'student' && (
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <p>• Department: <span className="font-bold">{modalExtraDetails.academicInformation?.branch || 'Computer Science'}</span></p>
                    <p>• CGPA: <span className="font-mono font-bold text-emerald-600">{modalExtraDetails.academicInformation?.cgpa || '8.5'}</span></p>
                    <p>• Skills Recorded: <span className="font-bold">{modalExtraDetails.skills?.length || modalExtraDetails.skillsList?.length || 0} skills</span></p>
                  </div>
                )}

                {selectedUser.role === 'company' && (
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <p>• Company: <span className="font-bold">{modalExtraDetails.companyName}</span></p>
                    <p>• Industry: <span className="font-bold">{modalExtraDetails.industry || 'Technology'}</span></p>
                    <p>• Verification: <span className="font-bold uppercase text-emerald-600">{modalExtraDetails.verificationStatus}</span></p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => handleToggleStatus(selectedUser._id, selectedUser.status)}
                    disabled={selectedUser._id === currentAdmin?.id}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition cursor-pointer"
                  >
                    Deactivate Account
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(selectedUser._id, selectedUser.status)}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition cursor-pointer"
                  >
                    Activate Account
                  </button>
                )}
              </div>

              <button
                onClick={() => setUserModalOpen(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
