import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  Briefcase, Building2, Users, Award, ExternalLink, 
  Clock, Check, Sparkles, Filter, ShieldCheck, Video, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyNotificationsPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'placement' | 'drives' | 'application'

  // Fetch Notifications from MongoDB
  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/faculty/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve faculty notifications.');
      }

      setNotifications(resData.notifications || []);
      setUnreadCount(resData.unreadCount || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setErrorMsg(err.message || 'Unable to connect to notifications service.');
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
  const handleMarkAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      await fetch(`/api/faculty/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const allIds = notifications.map(n => n.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch('/api/faculty/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: allIds })
      });
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  // Client-side filtering by tab
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.isRead;
    if (activeTab === 'placement') return notif.type === 'placement';
    if (activeTab === 'drives') return notif.type === 'job' || notif.type === 'internship';
    if (activeTab === 'application') return notif.type === 'application' || notif.type === 'interview';
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'placement':
        return { icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'job':
        return { icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
      case 'internship':
        return { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'interview':
        return { icon: Video, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      default:
        return { icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    }
  };

  return (
    <div className="space-y-8 pb-20 text-left max-w-5xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/faculty" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Bell className="h-7 w-7 text-amber-500" />
            <span>Institutional Activity & Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time feed of new campus job/internship drives, student applications, and verified placement offers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ CATEGORY TABS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          All Activity ({notifications.length})
        </button>

        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'unread'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px]">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('placement')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'placement'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          Placement Offers
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'drives'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          Campus Drives
        </button>

        <button
          onClick={() => setActiveTab('application')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'application'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          Applications & Interviews
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ NOTIFICATIONS LIST ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-amber-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Live Alerts...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <Bell className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
            No notifications in this view
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You're all caught up! New campus activity and recruiter drives will show up here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const { icon: Icon, color, bg } = getNotifIcon(notif.type);
            const notifDate = notif.timestamp ? new Date(notif.timestamp) : new Date();

            return (
              <div 
                key={notif.id}
                className={`glass-card p-5 sm:p-6 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.isRead 
                    ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5' 
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 opacity-90'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread" />
                      )}
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>

                    <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                      {notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {notifDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition cursor-pointer"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
