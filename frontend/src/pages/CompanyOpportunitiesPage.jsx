import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, GraduationCap, Plus, Search, Filter, Edit3, 
  Trash2, Eye, MapPin, DollarSign, Clock, CheckCircle2, 
  AlertCircle, X, Save, Sparkles, RefreshCw, Users, ArrowLeft,
  ChevronRight, Check, AlertTriangle, Layers, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyOpportunitiesPage() {
  const { token, user } = useAuth();

  // Data & Loading states
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab State: 'jobs' | 'internships' | 'all'
  const [activeTab, setActiveTab] = useState('jobs');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'closed'
  const [locationFilter, setLocationFilter] = useState('all'); // 'all' | 'remote' | 'onsite'

  // Modals
  const [viewOpp, setViewOpp] = useState(null);
  const [editOpp, setEditOpp] = useState(null);
  const [deleteOppId, setDeleteOppId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State (For Create / Edit)
  const [formType, setFormType] = useState('job');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('Remote');
  const [formStipend, setFormStipend] = useState('Competitive');
  const [formDuration, setFormDuration] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formStatus, setFormStatus] = useState('open');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ── SKILL DEMAND ANALYSIS MODAL STATE ──
  const [demandModal, setDemandModal] = useState({
    isOpen: false,
    opportunity: null,
    title: '',
    skillsInput: '',
    loading: false,
    data: null,
    error: ''
  });

  const handleOpenSkillDemandRequest = (opp = null, customSkillsStr = '') => {
    const initialSkills = opp
      ? (Array.isArray(opp.requiredSkills) ? opp.requiredSkills.join(', ') : '')
      : (customSkillsStr || '');

    setDemandModal({
      isOpen: true,
      opportunity: opp,
      title: opp ? opp.title : (customSkillsStr ? 'Required Skills Preview' : 'Campus Skill Demand Request'),
      skillsInput: initialSkills,
      loading: Boolean(initialSkills.trim()),
      data: null,
      error: ''
    });

    if (initialSkills.trim()) {
      fetchSkillDemandAnalysis(opp ? opp._id : null, initialSkills);
    }
  };

  const fetchSkillDemandAnalysis = async (opportunityId = null, skillsStr = '') => {
    const skillsArray = (skillsStr || demandModal.skillsInput || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (!opportunityId && skillsArray.length === 0) {
      setDemandModal(prev => ({ ...prev, error: 'Please specify at least one required skill keyword to analyze.', data: null }));
      return;
    }

    setDemandModal(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await fetch('/api/opportunities/skill-demand-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId,
          requiredSkills: skillsArray
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to analyze student talent availability.');
      }

      setDemandModal(prev => ({
        ...prev,
        loading: false,
        data: resData,
        error: ''
      }));
    } catch (err) {
      console.error('Error analyzing skill demand:', err);
      setDemandModal(prev => ({
        ...prev,
        loading: false,
        data: null,
        error: err.message || 'Unable to connect to talent availability service.'
      }));
    }
  };

  // Fetch opportunities belonging strictly to authenticated company
  const fetchOpportunities = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/opportunities/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to fetch company opportunities.');
      }

      setOpportunities(resData.opportunities || []);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setErrorMsg(err.message || 'Unable to retrieve opportunities from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOpportunities();
    }
  }, [token]);

  // Open Create Modal
  const handleOpenCreate = (type = 'job') => {
    setFormType(type);
    setFormTitle('');
    setFormDescription('');
    setFormLocation('Remote');
    setFormStipend('Competitive');
    setFormDuration('');
    setFormSkills('');
    setFormStatus('open');
    setFormError('');
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (opp) => {
    setEditOpp(opp);
    setFormType(opp.type || 'job');
    setFormTitle(opp.title || '');
    setFormDescription(opp.description || '');
    setFormLocation(opp.location || 'Remote');
    setFormStipend(opp.stipend || 'Competitive');
    setFormDuration(opp.duration || '');
    setFormSkills(Array.isArray(opp.requiredSkills) ? opp.requiredSkills.join(', ') : '');
    setFormStatus(opp.status || 'open');
    setFormError('');
  };

  // Handle Save (Create or Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim() || !formSkills.trim()) {
      setFormError('Role title, description, and required skills are required fields.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    const skillsArray = formSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      type: formType,
      description: formDescription.trim(),
      location: formLocation.trim() || 'Remote',
      stipend: formStipend.trim() || 'Competitive',
      duration: formType === 'internship' ? formDuration.trim() : '',
      requiredSkills: skillsArray,
      status: formStatus
    };

    try {
      const isEdit = !!editOpp;
      const url = isEdit ? `/api/opportunities/${editOpp._id}` : '/api/opportunities';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || `Failed to ${isEdit ? 'update' : 'post'} opportunity.`);
      }

      setSuccessMsg(`Opportunity ${isEdit ? 'updated' : 'published'} successfully!`);
      setShowCreateModal(false);
      setEditOpp(null);
      fetchOpportunities(true);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error submitting opportunity:', err);
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Opportunity
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to remove opportunity posting.');
      }

      setOpportunities(prev => prev.filter(o => o._id !== id));
      setDeleteOppId(null);
      setSuccessMsg('Opportunity posting removed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setErrorMsg(err.message || 'Error occurred while deleting posting.');
    }
  };

  // Tab counts
  const jobCount = opportunities.filter(o => o.type === 'job').length;
  const internshipCount = opportunities.filter(o => o.type === 'internship').length;

  // Filtered Opportunities List
  const filteredOpportunities = opportunities.filter(opp => {
    // Tab Match
    if (activeTab === 'jobs' && opp.type !== 'job') return false;
    if (activeTab === 'internships' && opp.type !== 'internship') return false;

    // Status Filter
    if (statusFilter !== 'all' && opp.status !== statusFilter) return false;

    // Location Filter
    if (locationFilter === 'remote' && !opp.location.toLowerCase().includes('remote')) return false;
    if (locationFilter === 'onsite' && opp.location.toLowerCase().includes('remote')) return false;

    // Search Query (title, skills, location)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = opp.title?.toLowerCase().includes(q);
      const locMatch = opp.location?.toLowerCase().includes(q);
      const skillsMatch = (opp.requiredSkills || []).some(s => s.toLowerCase().includes(q));
      if (!titleMatch && !locMatch && !skillsMatch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

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
            <Briefcase className="h-7 w-7 text-emerald-500" />
            <span>Opportunities Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish, manage, search, and monitor full-time jobs and internships for your organization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchOpportunities(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Postings"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          
          <button
            onClick={() => handleOpenSkillDemandRequest()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-purple-600/20 cursor-pointer active:scale-95"
            title="Evaluate Real Campus Student Availability for Custom Skill Sets"
          >
            <Sparkles className="h-4 w-4" />
            <span>Skill Demand Request</span>
          </button>

          <button
            onClick={() => handleOpenCreate(activeTab === 'internships' ? 'internship' : 'job')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Post New Opportunity</span>
          </button>
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

      {/* ━━━━━━━━━━━━━━━━━━━━ TABS: JOBS & INTERNSHIPS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          
          {/* Tab 1: Jobs */}
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Full-time Jobs</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'jobs' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {jobCount}
            </span>
          </button>

          {/* Tab 2: Internships */}
          <button
            onClick={() => setActiveTab('internships')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeTab === 'internships'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Internships</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'internships' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {internshipCount}
            </span>
          </button>

          {/* Tab 3: All */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>All ({opportunities.length})</span>
          </button>
        </div>

        {/* Quick Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, skill, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Status</option>
            <option value="open">Active (Open)</option>
            <option value="closed">Closed</option>
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote Only</option>
            <option value="onsite">On-site / Hybrid</option>
          </select>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ MAIN OPPORTUNITIES LIST ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-emerald-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Company Postings...</span>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No {activeTab === 'all' ? 'opportunities' : activeTab} found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery || statusFilter !== 'all' || locationFilter !== 'all'
                ? 'Try clearing your search query or filter tags to see all opportunities.'
                : `Publish your first ${activeTab === 'internships' ? 'internship' : 'job opening'} to start receiving pre-assessed candidates.`}
            </p>
          </div>
          <button
            onClick={() => handleOpenCreate(activeTab === 'internships' ? 'internship' : 'job')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            Post {activeTab === 'internships' ? 'Internship' : 'Job'} Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOpportunities.map(opp => (
            <div 
              key={opp._id} 
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-emerald-400/40 dark:hover:border-emerald-500/30 transition shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Type, Status & Actions */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                    opp.type === 'internship'
                      ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {opp.type}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      opp.status === 'open' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      ● {opp.status === 'open' ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                {/* Key Badges: Location, Stipend, Duration */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{opp.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{opp.stipend || 'Competitive'}</span>
                  </div>
                  {opp.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Duration: {opp.duration}</span>
                    </div>
                  )}
                </div>

                {/* Required Skills */}
                <div className="pt-1 flex flex-wrap gap-1">
                  {(opp.requiredSkills || []).slice(0, 4).map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                      {sk}
                    </span>
                  ))}
                  {(opp.requiredSkills || []).length > 4 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                      +{opp.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Applicants Count & Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>{opp.applicantCount || 0} Applicants</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenSkillDemandRequest(opp)}
                    className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition cursor-pointer flex items-center space-x-1"
                    title="Check Real Student Availability for Required Skills"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-[10px] font-extrabold hidden sm:inline">Talent Supply</span>
                  </button>

                  <button
                    onClick={() => setViewOpp(opp)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    title="View Posting Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(opp)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition cursor-pointer"
                    title="Edit Posting"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteOppId(opp._id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-700 dark:text-slate-300 hover:text-rose-500 transition cursor-pointer"
                    title="Delete Posting"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ VIEW MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {viewOpp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                  viewOpp.type === 'internship'
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {viewOpp.type}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  viewOpp.status === 'open' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  ● {viewOpp.status === 'open' ? 'Active' : 'Closed'}
                </span>
              </div>
              <button 
                onClick={() => setViewOpp(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{viewOpp.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <span>📍 {viewOpp.location || 'Remote'}</span>
                <span>💰 {viewOpp.stipend || 'Competitive'}</span>
                {viewOpp.duration && <span>⏱️ {viewOpp.duration}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {(viewOpp.requiredSkills || []).map((sk, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Role Description</h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                {viewOpp.description}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {viewOpp.applicantCount || 0} Total Candidates Applied
              </span>
              <button
                onClick={() => setViewOpp(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ CREATE / EDIT MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {(showCreateModal || editOpp) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editOpp ? 'Edit Opportunity Posting' : 'Post New Opportunity'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editOpp ? 'Update requirements and parameters' : 'Publish opening to student talent catalog'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditOpp(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              {/* Type Switcher */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Opportunity Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('job')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                      formType === 'job'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Full-time Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('internship')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                      formType === 'internship'
                        ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Internship
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Position Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack React Developer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              {/* Required Skills */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Required Skills (Comma separated) *
                  </label>
                  {formSkills.trim() && (
                    <button
                      type="button"
                      onClick={() => handleOpenSkillDemandRequest(null, formSkills)}
                      className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Check Campus Talent Supply</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Node.js, Express, MongoDB, TypeScript"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none focus:border-emerald-500 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Matched with verified student Skill DNA.</p>
              </div>

              {/* Location & Stipend */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / Bengaluru"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Compensation / Stipend
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹35,000 / month, Competitive"
                    value={formStipend}
                    onChange={(e) => setFormStipend(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Internship Duration & Status */}
              <div className="grid grid-cols-2 gap-3">
                {formType === 'internship' ? (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Internship Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6 Months"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div />
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Posting Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500 cursor-pointer font-bold"
                  >
                    <option value="open">Active (Open for Applications)</option>
                    <option value="closed">Closed (Applications Stopped)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Description & Requirements *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Outline core responsibilities, day-to-day deliverables, and ideal candidate credentials..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditOpp(null);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editOpp ? 'Save Changes' : 'Publish Opportunity'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ DELETE CONFIRMATION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {deleteOppId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/30 bg-white dark:bg-slate-950 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Opportunity Posting?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete this opening? This will remove the listing from student discovery.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteOppId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteOppId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Yes, Delete Posting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SKILL DEMAND REQUEST & TALENT AVAILABILITY MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {demandModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border-2 border-purple-500/30 bg-white dark:bg-slate-950 space-y-6 text-left shadow-2xl relative my-8">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 font-mono font-extrabold uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span>Real-Time Talent Availability</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Live Database Match</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>{demandModal.title || 'Skill Demand Request Analysis'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluate real campus candidate availability, skill proficiency distributions, and average match readiness from active student profiles.
                </p>
              </div>

              <button
                onClick={() => setDemandModal(prev => ({ ...prev, isOpen: false }))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Input & Action Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase font-mono text-slate-700 dark:text-slate-300">
                Specify Required Skills for Job/Internship:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, AWS, Docker"
                  value={demandModal.skillsInput}
                  onChange={(e) => setDemandModal(prev => ({ ...prev, skillsInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchSkillDemandAnalysis(null, demandModal.skillsInput);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => fetchSkillDemandAnalysis(null, demandModal.skillsInput)}
                  disabled={demandModal.loading || !demandModal.skillsInput.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-purple-600/20 cursor-pointer shrink-0"
                >
                  {demandModal.loading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>Analyze Availability</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {demandModal.error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{demandModal.error}</span>
              </div>
            )}

            {/* Loading State */}
            {demandModal.loading ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <RefreshCw className="h-6 w-6 animate-spin text-purple-500 mx-auto" />
                <p className="text-xs font-mono font-bold uppercase tracking-wider">
                  Analyzing real student database profiles...
                </p>
              </div>
            ) : demandModal.data ? (
              <div className="space-y-6">
                
                {/* 3 Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  
                  {/* Matching Students Count */}
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
                      Matching Students
                    </span>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {demandModal.data.matchingStudentsCount}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Out of {demandModal.data.totalStudentsCount} total registered students
                    </p>
                  </div>

                  {/* Average Match Compatibility */}
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      Average Match Rate
                    </span>
                    <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {demandModal.data.averageMatchPercentage}%
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Based on required skills matching
                    </p>
                  </div>

                  {/* Required Skills Requested */}
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      Skills Evaluated
                    </span>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {(demandModal.data.requiredSkills || []).length}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {(demandModal.data.requiredSkills || []).join(', ')}
                    </p>
                  </div>

                </div>

                {/* Skill Proficiency Distribution */}
                {Object.keys(demandModal.data.proficiencyDistribution || {}).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white flex items-center space-x-2">
                      <Layers className="h-4 w-4 text-purple-500" />
                      <span>Skill Proficiency Distribution</span>
                    </h4>

                    <div className="space-y-2.5">
                      {Object.entries(demandModal.data.proficiencyDistribution).map(([skillName, dist]) => (
                        <div 
                          key={skillName}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white">{skillName}</span>
                            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                              {dist.totalWithSkill} {dist.totalWithSkill === 1 ? 'candidate possesses skill' : 'candidates possess skill'}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Beginner: <strong className="text-slate-900 dark:text-white">{dist.Beginner}</strong>
                            </div>
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                              Intermediate: <strong>{dist.Intermediate}</strong>
                            </div>
                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                              Advanced: <strong>{dist.Advanced}</strong>
                            </div>
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                              Expert: <strong>{dist.Expert}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Students List OR No Matching Students Empty State */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white flex items-center space-x-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    <span>Matching Student Talent ({demandModal.data.matchingStudents?.length || 0})</span>
                  </h4>

                  {demandModal.data.matchingStudents?.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Users className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                        No matching students available yet.
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        No students in the registered cohort currently match these required skills. Check back as new students join and verify their proficiencies.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                      {demandModal.data.matchingStudents.map(st => (
                        <div
                          key={st.studentId}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:border-purple-400/40 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900 dark:text-white">{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{st.department}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(st.matchedSkills || []).map((sk, idx) => (
                                <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                                  ✓ {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {st.matchPercentage}% Match
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
