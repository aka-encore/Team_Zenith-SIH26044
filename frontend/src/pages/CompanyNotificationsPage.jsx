import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  ChevronRight, Users, Award, Video, Briefcase, AlertTriangle, 
  Check, CheckCheck, Filter, Clock, ExternalLink, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function CompanyNotificationsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter State
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'unread' | 'application' | 'shortlist' | 'interview_scheduled' | 'opportunity'

  // Fetch notifications
  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/companies/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve company notifications.');
      }

      setNotifications(resData.notifications || []);
      setUnreadCount(resData.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setErrorMsg(err.message || 'Unable to connect to notification service.');
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

  // Mark single notification as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();

    try {
      const response = await fetch(`/api/companies/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update notification.');
      }

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const response = await fetch('/api/companies/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds: unreadIds })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to mark all as read.');
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      setSuccessMsg('All notifications marked as read.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Mark all read error:', err);
      setErrorMsg(err.message || 'Error updating notifications.');
    }
  };

  // Get icon and color styling by notification type
  const getTypeMeta = (type) => {
    switch (type) {
      case 'application':
        return {
          icon: Users,
          bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          label: 'Application'
        };
      case 'shortlist':
        return {
          icon: Award,
          bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          label: 'Shortlisted'
        };
      case 'interview_scheduled':
        return {
          icon: Video,
          bgColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          label: 'Interview'
        };
      case 'interview_cancelled':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          label: 'Cancelled'
        };
      case 'opportunity':
        return {
          icon: Briefcase,
          bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          label: 'Opportunity'
        };
      default:
        return {
          icon: Bell,
          bgColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          label: 'System'
        };
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter(n => {
    if (categoryFilter === 'unread') return !n.read;
    if (categoryFilter !== 'all' && n.type !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-20 text-left max-w-5xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/company" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Bell className="h-7 w-7 text-amber-500" />
            <span>Company Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-xs">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time hiring alerts, applicant submissions, shortlist activities, and scheduled interviews.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Notifications"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <CheckCheck className="h-4 w-4 text-emerald-500" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ FILTER TABS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          { id: 'unread', label: 'Unread Only', count: unreadCount },
          { id: 'application', label: 'Applications', count: notifications.filter(n => n.type === 'application').length },
          { id: 'shortlist', label: 'Shortlisted', count: notifications.filter(n => n.type === 'shortlist').length },
          { id: 'interview_scheduled', label: 'Interviews', count: notifications.filter(n => n.type === 'interview_scheduled' || n.type === 'interview_cancelled').length },
          { id: 'opportunity', label: 'Opportunities', count: notifications.filter(n => n.type === 'opportunity').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              categoryFilter === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              categoryFilter === tab.id
                ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ NOTIFICATIONS LIST ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-amber-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Live Notifications...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No notifications in this category
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {categoryFilter === 'unread'
                ? 'All caught up! There are no unread notifications.'
                : 'Activity notifications will appear automatically when candidates apply or interview statuses change.'}
            </p>
          </div>
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Show All Notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notif => {
            const meta = getTypeMeta(notif.type);
            const Icon = meta.icon;
            const notifDate = notif.timestamp ? new Date(notif.timestamp) : new Date();

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) handleMarkAsRead(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                className={`glass-card p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer text-left ${
                  notif.read
                    ? 'border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                    : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5 hover:bg-amber-500/10'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  
                  {/* Category Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${meta.bgColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${meta.bgColor}`}>
                        {meta.label}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread notification" />
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-0.5 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {notifDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  {!notif.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <div className="p-2 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
