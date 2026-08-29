import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, CheckCircle2, Clock, Briefcase, Award, Zap, 
  Trash2, Sparkles, Filter, ChevronRight, Check, Loader2,
  RefreshCw, Video, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentNotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/students/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        throw new Error(data.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching student notifications:', err);
      setErrorMsg(err.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const res = await fetch('/api/students/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds: unreadIds })
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      const res = await fetch(`/api/students/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'student_selected':
      case 'placement_completed':
        return { icon: Award, color: 'text-emerald-500 bg-emerald-500/10' };
      case 'interview_scheduled':
        return { icon: Video, color: 'text-indigo-500 bg-indigo-500/10' };
      case 'student_shortlisted':
        return { icon: Sparkles, color: 'text-amber-500 bg-amber-500/10' };
      case 'application_submitted':
      case 'application_reviewed':
        return { icon: Briefcase, color: 'text-blue-500 bg-blue-500/10' };
      default:
        return { icon: Bell, color: 'text-slate-500 bg-slate-500/10' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-left">
      
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono">
              <Bell className="h-3.5 w-3.5" />
              <span>Real-Time Notifications</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live alerts for application progress, interview schedules, and recruiter hiring updates.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark all as read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading your notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Bell className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No new notifications</h3>
          <p className="text-xs text-slate-500">You're all caught up with your career updates!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const { icon: Icon, color } = getNotificationIcon(notif.type);

            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && markSingleAsRead(notif.id)}
                className={`glass-card p-5 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                  !notif.read
                    ? 'border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                    
                    <div className="flex items-center space-x-3 pt-1 text-[11px] font-mono text-slate-400">
                      <span>{new Date(notif.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markSingleAsRead(notif.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer shrink-0"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
