import React, { useState } from 'react';
import { 
  Bell, CheckCircle2, Clock, Briefcase, Award, Zap, 
  Trash2, Sparkles, Filter, ChevronRight, Check
} from 'lucide-react';


const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "assessment",
    title: "New Skill Level Earned in Node.js!",
    message: "Congratulations! You scored 60% and earned the 'Advanced' proficiency level. Your Student Profile has been updated in MongoDB.",
    time: "10 mins ago",
    read: false,
    icon: Award,
    color: "text-purple-500 bg-purple-500/10"
  },
  {
    id: 2,
    type: "interview",
    title: "Interview Scheduled with TechNova Solutions",
    message: "Your Technical Round 1 for Backend Developer Intern is confirmed for tomorrow at 3:30 PM IST via Google Meet.",
    time: "2 hours ago",
    read: false,
    icon: Briefcase,
    color: "text-emerald-500 bg-emerald-500/10"
  },
  {
    id: 3,
    type: "opportunity",
    title: "High Match Opportunity: Cloud Developer",
    message: "CloudScale Systems posted a new opening with an 84% skill match against your verified competencies.",
    time: "1 day ago",
    read: true,
    icon: Zap,
    color: "text-blue-500 bg-blue-500/10"
  }
];


export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-left">
      
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono">
              <Bell className="h-3.5 w-3.5" />
              <span>Real-Time Notifications</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500">Live alerts for assessment achievements, interview schedules, and recruiter messages.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer w-fit"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Bell className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No new notifications</h3>
          <p className="text-xs text-slate-500">You're all caught up with your career updates!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = notif.icon;

            return (
              <div
                key={notif.id}
                className={`glass-card p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  !notif.read
                    ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/5 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${notif.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                    <span className="text-[11px] font-mono text-slate-400 block pt-1">{notif.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => clearNotification(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                  title="Dismiss notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
