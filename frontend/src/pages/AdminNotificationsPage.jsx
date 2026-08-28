import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, Check, CheckCheck, RefreshCw, AlertCircle, 
  ArrowLeft, Users, Building2, Briefcase, FileText, 
  GraduationCap, ShieldAlert, Sparkles, ChevronRight, 
  CheckCircle2, Clock, Inbox, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminNotificationsPage() {
  const { token, user: currentAdmin } = useAuth();

  // Data & State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Category Filter
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch Notifications
  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve notifications.');
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Admin notifications fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to notification telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Mark Single Notification as Read
  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark All Notifications as Read
  const handleMarkAllAsRead = async () => {
    try {
      const allIds = notifications.map(n => n._id);
      const response = await fetch('/api/admin/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds: allIds })
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        setActionSuccess('All notifications marked as read.');
        setTimeout(() => setActionSuccess(''), 3500);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Format Time
  const formatTime = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get Notification Icon by Type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'company_verification':
        return <Building2 className="h-5 w-5 text-purple-500" />;
      case 'new_opportunity':
        return <Briefcase className="h-5 w-5 text-emerald-500" />;
      case 'new_application':
        return <FileText className="h-5 w-5 text-cyan-500" />;
      case 'placement_update':
        return <GraduationCap className="h-5 w-5 text-amber-500" />;
      default:
        return <ShieldAlert className="h-5 w-5 text-indigo-500" />;
    }
  };

  // Filtered Notifications
  const filteredNotifications = categoryFilter === 'all'
    ? notifications
    : notifications.filter(n => n.category?.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="space-y-8 pb-20 text-left max-w-5xl mx-auto">

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
            <Bell className="h-7 w-7 text-amber-500" />
            <span>Platform Activity Feed</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-tenant telemetry tracking user signups, employer verifications, applications, placements, and security audits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}

          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ CATEGORY PILLS FILTER ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {['all', 'users', 'companies', 'opportunities', 'applications', 'placements', 'system'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] transition cursor-pointer shrink-0 ${
              categoryFilter === cat
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            {cat === 'all' ? `All Activity (${notifications.length})` : cat}
          </button>
        ))}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ NOTIFICATIONS LIST ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-3 glass-card rounded-3xl">
            <RefreshCw className="h-7 w-7 animate-spin text-amber-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Platform Activity...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-card p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white/70 dark:bg-slate-900/60">
            <Inbox className="h-10 w-10 mx-auto text-slate-400" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No notifications in this category</h3>
            <p className="text-xs text-slate-400">All recent platform events and verification requests have been processed.</p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div 
              key={item._id}
              className={`glass-card p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                item.read 
                  ? 'border-slate-200/70 dark:border-slate-800/70 bg-white/40 dark:bg-slate-900/30 opacity-80'
                  : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold uppercase">
                      {item.category}
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1 font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(item.createdAt)}</span>
                    </span>

                    {item.link && (
                      <Link 
                        to={item.link}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-0.5"
                      >
                        <span>Open Module</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!item.read && (
                <button
                  onClick={() => handleMarkAsRead(item._id)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-800 transition cursor-pointer shrink-0 shadow-xs"
                  title="Mark as Read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
