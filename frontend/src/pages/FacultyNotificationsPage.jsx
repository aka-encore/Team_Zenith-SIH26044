import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft,
  Briefcase, Building2, Users, Award, ExternalLink,
  Clock, Check, Filter, Video, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getNotifStyle(type) {
  switch (type) {
    case 'placement':   return { Icon: Award,     iconBg: 'var(--fac-emerald-tint)', iconColor: 'var(--fac-emerald-bright)' };
    case 'job':         return { Icon: Building2, iconBg: 'var(--fac-emerald-tint)', iconColor: 'var(--fac-emerald-bright)' };
    case 'internship':  return { Icon: Briefcase, iconBg: 'var(--fac-gold-tint)',    iconColor: 'var(--fac-gold)' };
    case 'interview':   return { Icon: Video,     iconBg: 'var(--fac-gold-tint)',    iconColor: 'var(--fac-gold)' };
    default:            return { Icon: Users,     iconBg: 'var(--fac-bg-surface)',   iconColor: 'var(--fac-text-secondary)' };
  }
}

export default function FacultyNotificationsPage() {
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');
  const [activeTab,     setActiveTab]     = useState('all');

  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true); else setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/faculty/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to retrieve faculty notifications.');
      setNotifications(resData.notifications || []);
      setUnreadCount(resData.unreadCount || 0);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to notifications service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (token) fetchNotifications(); }, [token]);

  const handleMarkAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await fetch(`/api/faculty/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) { console.error('Error marking notification read:', err); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const allIds = notifications.map(n => n.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await fetch('/api/faculty/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: allIds })
      });
    } catch (err) { console.error('Error marking all notifications read:', err); }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread')      return !n.isRead;
    if (activeTab === 'placement')   return n.type === 'placement';
    if (activeTab === 'drives')      return n.type === 'job' || n.type === 'internship';
    if (activeTab === 'application') return n.type === 'application' || n.type === 'interview';
    return true;
  });

  const tabs = [
    { key: 'all',         label: 'All Activity',           count: notifications.length },
    { key: 'unread',      label: 'Unread',                 count: unreadCount },
    { key: 'placement',   label: 'Placement Offers',        count: notifications.filter(n => n.type === 'placement').length },
    { key: 'drives',      label: 'Campus Drives',           count: notifications.filter(n => n.type === 'job' || n.type === 'internship').length },
    { key: 'application', label: 'Applications & Interviews', count: notifications.filter(n => n.type === 'application' || n.type === 'interview').length },
  ];

  return (
    <div className="fac-theme-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: 'var(--fac-emerald-bright)', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft style={{ width: '12px', height: '12px' }} /> Back to Command Center
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fac-gold-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Bell style={{ width: '18px', height: '18px', color: 'var(--fac-gold)' }} />
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '15px', height: '15px', borderRadius: '50%', background: 'var(--fac-emerald-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#FFFFFF' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Institutional Activity & Alerts</h1>
              <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: 0 }}>Real-time campus recruitment drives, student assessment completions, and verified offer letters</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="fac-btn-emerald" style={{ fontSize: '11px', padding: '6px 12px' }}>
              <Check style={{ width: '12px', height: '12px' }} /> Mark All Read
            </button>
          )}
          <button onClick={() => fetchNotifications(true)} disabled={refreshing} className="fac-btn-dark" style={{ padding: '6px 10px' }}>
            <RefreshCw style={{ width: '12px', height: '12px', ...(refreshing ? { animation: 'spin 1s linear infinite' } : {}) }} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(224, 82, 82, 0.1)', border: '1px solid rgba(224, 82, 82, 0.25)', color: 'var(--fac-error)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} /> {errorMsg}
        </div>
      )}

      {/* Tabs & List */}
      <div className="fac-theme-card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--fac-border)', padding: '0 16px', background: 'var(--fac-table-head-bg)', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? 'var(--fac-text-primary)' : 'var(--fac-text-muted)',
                borderBottom: activeTab === tab.key ? '2px solid var(--fac-emerald-bright)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.14s ease', marginBottom: '-1px', whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              <span style={{
                fontSize: '9.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '9999px',
                background: 'var(--fac-bg-surface)',
                border: '1px solid var(--fac-border)',
                color: activeTab === tab.key ? 'var(--fac-emerald-bright)' : 'var(--fac-text-muted)',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div style={{ padding: '8px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '10px', color: 'var(--fac-text-secondary)' }}>
              <RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite', color: 'var(--fac-emerald-bright)' }} />
              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Loading live alerts…</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--fac-text-muted)' }}>
              <Bell style={{ width: '28px', height: '28px', margin: '0 auto 10px', color: 'var(--fac-border-hover)' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fac-text-primary)', margin: '0 0 4px' }}>No notifications in this view</p>
              <p style={{ fontSize: '12px', margin: 0 }}>You're all caught up! New campus activity and corporate drives will appear here.</p>
            </div>
          ) : (
            filteredNotifications.map(notif => {
              const { Icon, iconBg, iconColor } = getNotifStyle(notif.type);
              const notifDate = notif.timestamp ? new Date(notif.timestamp) : null;

              return (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    gap: '12px', padding: '14px 20px',
                    borderBottom: '1px solid var(--fac-table-border)',
                    background: !notif.isRead ? 'var(--fac-emerald-tint)' : 'transparent',
                    borderLeft: !notif.isRead ? '3px solid var(--fac-emerald-bright)' : '3px solid transparent',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Icon style={{ width: '15px', height: '15px', color: iconColor }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        {!notif.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--fac-emerald-bright)', flexShrink: 0 }} />}
                        <span style={{ fontSize: '13px', fontWeight: !notif.isRead ? 700 : 600, color: 'var(--fac-text-primary)' }}>{notif.title}</span>
                        {notifDate && (
                          <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)', fontWeight: 500 }}>· {timeAgo(notif.timestamp)}</span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: 0, lineHeight: 1.55 }}>{notif.message}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {notif.link && (
                      <Link to={notif.link} className="fac-btn-dark" style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}>
                        View <ChevronRight style={{ width: '10px', height: '10px' }} />
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="fac-btn-dark"
                        style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--fac-emerald-bright)' }}
                        title="Mark read"
                      >
                        <Check style={{ width: '11px', height: '11px' }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
