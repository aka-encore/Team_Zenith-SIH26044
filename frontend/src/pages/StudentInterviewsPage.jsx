import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Video, Building2, MapPin, CheckCircle2, 
  Award, Sparkles, ArrowRight, ExternalLink, ShieldCheck, ChevronRight,
  Loader2, HelpCircle
} from 'lucide-react';


export default function StudentInterviewsPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('interviews'); // 'interviews' | 'placement'
  const [interviews, setInterviews] = useState([]);
  const [placementDrives, setPlacementDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real application status for interviews and opportunities for placement drives
  const fetchInterviewsAndPlacement = async () => {
    setLoading(true);
    try {
      const [appsRes, oppsRes] = await Promise.all([
        fetch('/api/applications/my-applications', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/opportunities', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const appsData = await appsRes.json();
      const oppsData = await oppsRes.json();

      if (appsData.success && Array.isArray(appsData.applications)) {
        // Filter applications that are shortlisted or in interview/placement stage
        const shortlistedApps = appsData.applications.filter(a => 
          ['shortlisted', 'accepted', 'selected', 'interview'].includes((a.status || '').toLowerCase()) ||
          (a.interviewDetails && a.interviewDetails.scheduledAt)
        );

        const mappedInterviews = shortlistedApps.map(a => {
          const int = a.interviewDetails || {};
          const scheduledDate = int.scheduledAt ? new Date(int.scheduledAt) : new Date(a.updatedAt || a.createdAt);

          return {
            id: a._id,
            role: a.opportunityId?.title || 'Technical Role',
            company: a.opportunityId?.companyId?.companyName || a.opportunityId?.company?.name || 'Partner Company',
            location: a.opportunityId?.location || 'Remote',
            date: int.scheduledAt 
              ? scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : (int.date || scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
            time: int.scheduledAt 
              ? scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : (int.time || '11:00 AM IST'),
            round: int.interviewType || int.round || 'Technical Round 1 (System & Domain Evaluation)',
            platform: int.mode === 'onsite' ? 'On-Premises Office' : int.mode === 'phone' ? 'Telephonic Interview' : 'Virtual Video (Google Meet / Zoom)',
            interviewer: int.interviewer || 'Technical Hiring Panel',
            status: ['accepted', 'selected'].includes((a.status || '').toLowerCase()) 
              ? 'Offer Extended' 
              : (int.status === 'cancelled' ? 'Cancelled' : int.status === 'completed' ? 'Completed' : 'Interview Scheduled'),
            link: int.meetingLink || 'https://meet.google.com',
            notes: int.notes || ''
          };
        });

        setInterviews(mappedInterviews);
      }

      if (oppsData.success && Array.isArray(oppsData.opportunities)) {
        const fullTimeJobs = oppsData.opportunities.filter(o => o.type === 'job' || o.isPlacementDrive);
        setPlacementDrives(fullTimeJobs);
      }
    } catch (err) {
      console.error('Error fetching interviews and placement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInterviewsAndPlacement();
    }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Campus & Corporate Placement Hub</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Interviews & Placement
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            View scheduled video interviews, join links, interview preparation tips, and campus placement drives.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
          {interviews.length} Scheduled Rounds
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold pb-px">
        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-3 px-2 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'interviews'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Scheduled Interviews ({interviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('placement')}
          className={`pb-3 px-2 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'placement'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Placement Drives & Offers ({placementDrives.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading interview & placement status...</span>
        </div>
      ) : null}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 1: INTERVIEWS ━━━━━━━━━━━━━━━━━━━━ */}
      {!loading && activeTab === 'interviews' && (
        <div className="space-y-4 animate-in fade-in">
          {interviews.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Video className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No scheduled interviews yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When recruiters review and shortlist your applications, your interview meeting links and schedules will appear here.
              </p>
            </div>
          ) : (
            interviews.map((intv) => (
              <div
                key={intv.id}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase font-mono border border-emerald-500/20">
                      {intv.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{intv.platform}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{intv.role}</h3>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{intv.company} • {intv.round}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{intv.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span>{intv.time}</span>
                    </span>
                    <span>•</span>
                    <span>Interviewer: {intv.interviewer}</span>
                  </div>
                </div>

                <a
                  href={intv.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2 shrink-0 cursor-pointer w-fit"
                >
                  <Video className="h-4 w-4" />
                  <span>Join Meeting Room</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 2: PLACEMENT DRIVES ━━━━━━━━━━━━━━━━━━━━ */}
      {!loading && activeTab === 'placement' && (
        <div className="space-y-4 animate-in fade-in">
          {placementDrives.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Award className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No active placement drives</h3>
              <p className="text-xs text-slate-500">Upcoming campus placement drives will be listed here.</p>
            </div>
          ) : (
            placementDrives.map((drive) => (
              <div
                key={drive._id}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase font-mono border border-blue-500/20">
                      {drive.status || 'Active Drive'}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{drive.stipend || 'Competitive Package'}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{drive.company?.name || drive.company || 'Enterprise Partner'}</h3>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{drive.title}</p>
                  </div>

                  <div className="text-xs text-slate-500 font-mono space-y-1 pt-1">
                    <div>Location: {drive.location || 'Pan-India'}</div>
                    <div>Required Skills: {(drive.requiredSkills || []).join(', ')}</div>
                  </div>
                </div>

                <a
                  href="/opportunities"
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs shadow-md transition cursor-pointer shrink-0 w-fit"
                >
                  View Details & Apply
                </a>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
