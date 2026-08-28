import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Search, Filter, RefreshCw, AlertCircle, 
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck, 
  Check, X, Eye, ShieldAlert, Briefcase, Globe, 
  Mail, Phone, MapPin, Sparkles, ChevronRight, Ban, 
  Clock, AlertTriangle, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminCompaniesPage() {
  const { token, user: currentAdmin } = useAuth();

  // Data & Status State
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Viewing Company
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [companyOpportunities, setCompanyOpportunities] = useState([]);

  // Action Loading State
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch Companies from MongoDB
  const fetchCompanies = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (industryFilter !== 'all') params.append('industry', industryFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/companies?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve employer records.');
      }

      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Admin Companies fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to company verification service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCompanies();
    }
  }, [token, statusFilter, industryFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchCompanies();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update company verification status
  const handleUpdateVerification = async (companyId, newStatus) => {
    setActionLoadingId(companyId);
    setActionSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/verification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update company verification.');
      }

      setCompanies(prev => prev.map(c => c._id === companyId ? { ...c, verificationStatus: newStatus } : c));
      if (selectedCompany && selectedCompany._id === companyId) {
        setSelectedCompany(prev => ({ ...prev, verificationStatus: newStatus }));
      }

      setActionSuccessMsg(`Company status successfully updated to "${newStatus.toUpperCase()}".`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Verification update error:', err);
      setErrorMsg(err.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Inspect Company Modal
  const handleInspectCompany = async (company) => {
    setSelectedCompany(company);
    setCompanyOpportunities([]);
    setCompanyModalOpen(true);
    setLoadingDetails(true);

    try {
      const response = await fetch(`/api/admin/companies/${company._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCompanyOpportunities(data.opportunities || []);
      }
    } catch (err) {
      console.error('Error fetching company details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setIndustryFilter('all');
    setStatusFilter('all');
  };

  // Unique industries list from current records
  const uniqueIndustries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)));

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
            <Building2 className="h-7 w-7 text-purple-500" />
            <span>Employer Corporate Verification</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review partner employers, manage KYC credentials, verify corporate profiles, and audit active hiring drives.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchCompanies(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Companies"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-purple-500' : ''}`} />
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
              placeholder="Search by company name, location, HR email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500"
            />
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Industries</option>
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Employers</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

        </div>

        {(searchQuery || industryFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {companies.length} Employers Matching Filters
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

      {/* ━━━━━━━━━━━━━━━━━━━━ COMPANIES TABLE ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              <span>Registered Corporate Employers</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live corporate records with direct KYC verification approval workflows
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total {companies.length} Companies
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-purple-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Employer Records...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Building2 className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p>No company records found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Company Profile</th>
                  <th className="p-3.5">Industry & HQ</th>
                  <th className="p-3.5">HR Contact</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">Drives (Jobs / Internships)</th>
                  <th className="p-3.5 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {companies.map(c => {
                  const isActionLoading = actionLoadingId === c._id;

                  return (
                    <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      
                      {/* Company Name & Logo */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                            {c.logo ? (
                              <img src={c.logo} alt={c.companyName} className="w-full h-full object-cover" />
                            ) : (
                              c.companyName?.charAt(0) || 'C'
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {c.companyName}
                            </span>
                            {c.website && (
                              <a 
                                href={c.website.startsWith('http') ? c.website : `https://${c.website}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-purple-600 dark:text-purple-400 text-[11px] hover:underline flex items-center space-x-1"
                              >
                                <span className="truncate max-w-[160px]">{c.website}</span>
                                <Globe className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Industry & Location */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {c.industry || 'Technology'}
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{c.location || 'Bengaluru, India'}</span>
                          </span>
                        </div>
                      </td>

                      {/* HR Email */}
                      <td className="p-3.5">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {c.hrName}
                          </span>
                          <span className="text-slate-400 block truncate max-w-[180px]">
                            {c.contactEmail}
                          </span>
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          c.verificationStatus === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : c.verificationStatus === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : c.verificationStatus === 'suspended'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          ● {c.verificationStatus}
                        </span>
                      </td>

                      {/* Opportunities Count */}
                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                            {c.activeJobsCount} Jobs
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                            {c.activeInternshipsCount} Interns
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5">
                        
                        {/* View Company */}
                        <button
                          onClick={() => handleInspectCompany(c)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>

                        {/* Verify Button */}
                        {c.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => handleUpdateVerification(c._id, 'verified')}
                            disabled={isActionLoading}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Verify Corporate Account"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Verify</span>
                          </button>
                        )}

                        {/* Reject Button */}
                        {c.verificationStatus === 'pending' && (
                          <button
                            onClick={() => handleUpdateVerification(c._id, 'rejected')}
                            disabled={isActionLoading}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Reject Application"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        {/* Suspend Button */}
                        {c.verificationStatus === 'verified' && (
                          <button
                            onClick={() => handleUpdateVerification(c._id, 'suspended')}
                            disabled={isActionLoading}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Suspend Company"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span>Suspend</span>
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

      {/* ━━━━━━━━━━━━━━━━━━━━ COMPANY INSPECTION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {companyModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedCompany.companyName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedCompany.companyName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCompany.industry || 'Technology'} • {selectedCompany.location}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setCompanyModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overview Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                <span className="font-extrabold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedCompany.verificationStatus}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">HR Contact</span>
                <span className="font-extrabold text-slate-900 dark:text-white truncate block">
                  {selectedCompany.hrName || 'HR Partner'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">HR Email</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono truncate block">
                  {selectedCompany.contactEmail}
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedCompany.description && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">About Organization</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedCompany.description}
                </p>
              </div>
            )}

            {/* Posted Opportunities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Hiring Drives & Roles ({companyOpportunities.length})
              </h4>

              {loadingDetails ? (
                <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                  <span>Loading Campus Drives...</span>
                </div>
              ) : companyOpportunities.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  No active hiring drives posted by this company yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {companyOpportunities.map(opp => (
                    <div key={opp._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {opp.title}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {opp.location || 'Remote'} • <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{opp.stipend || 'Competitive'}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase">
                          {opp.type}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/20">
                          ● {opp.status || 'open'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="space-x-2">
                {selectedCompany.verificationStatus !== 'verified' && (
                  <button
                    onClick={() => handleUpdateVerification(selectedCompany._id, 'verified')}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition cursor-pointer"
                  >
                    Verify Company
                  </button>
                )}

                {selectedCompany.verificationStatus === 'verified' && (
                  <button
                    onClick={() => handleUpdateVerification(selectedCompany._id, 'suspended')}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl transition cursor-pointer"
                  >
                    Suspend Company
                  </button>
                )}
              </div>

              <button
                onClick={() => setCompanyModalOpen(false)}
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
