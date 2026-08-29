import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cpu, TrendingUp, Sparkles, Target, AlertTriangle, ArrowRight,
  CheckCircle2, Compass, Layers, Zap, BookOpen, Flame, ChevronRight,
  ShieldCheck, HelpCircle, BarChart3, Clock, Briefcase, RefreshCw
} from 'lucide-react';

export default function SkillGapPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // State from real backend Skill Matching Engine
  const [currentSkills, setCurrentSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedTargetRole, setSelectedTargetRole] = useState(null);
  
  // Real calculation states
  const [matchPercentage, setMatchPercentage] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [weakSkills, setWeakSkills] = useState([]);
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  const [targetSkills, setTargetSkills] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch real student skill gap data from backend
  const fetchSkillGapData = async (targetId = selectedTargetId) => {
    if (!token) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (targetId) {
        params.append('opportunityId', targetId);
      }

      const res = await fetch(`/api/students/skill-gap?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to calculate skill gap analysis.');
      }

      setCurrentSkills(data.currentSkills || []);
      setOpportunities(data.opportunities || []);
      
      if (targetId && data.hasTargetSelected) {
        setMatchPercentage(data.matchPercentage);
        setMatchedSkills(data.matchedSkills || []);
        setMissingSkills(data.missingSkills || []);
        setWeakSkills(data.weakSkills || []);
        setRecommendedSkills(data.recommendedSkills || []);
        setTargetSkills(data.targetSkills || []);
        setSelectedTargetRole(data.selectedOpportunity || null);
      } else {
        setMatchPercentage(null);
        setMatchedSkills([]);
        setMissingSkills([]);
        setWeakSkills([]);
        setRecommendedSkills([]);
        setTargetSkills([]);
        setSelectedTargetRole(null);
      }
    } catch (err) {
      console.error('Error loading real skill gap data:', err);
      setErrorMsg(err.message || 'Error connecting to Skill Matching Engine.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load: If opportunities exist, auto-select first one, or allow manual selection
  useEffect(() => {
    if (token) {
      fetch('/api/students/skill-gap', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCurrentSkills(data.currentSkills || []);
            setOpportunities(data.opportunities || []);
            if (data.opportunities && data.opportunities.length > 0) {
              const firstOppId = data.opportunities[0]._id;
              setSelectedTargetId(firstOppId);
              fetchSkillGapData(firstOppId);
            } else {
              setLoading(false);
            }
          }
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [token]);

  const handleSelectTarget = (oppId) => {
    setSelectedTargetId(oppId);
    if (oppId) {
      fetchSkillGapData(oppId);
    } else {
      setSelectedTargetRole(null);
      setMatchPercentage(null);
      setMatchedSkills([]);
      setMissingSkills([]);
      setWeakSkills([]);
      setRecommendedSkills([]);
      setTargetSkills([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HERO BANNER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Market Alignment Engine</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Skill Gap & Demand Analysis
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
            Compare your verified MongoDB profile skills against real live employer requirements using the Skill Matching Engine.
          </p>
        </div>

        <button
          onClick={() => navigate('/skills')}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-600/25 transition flex items-center space-x-2 cursor-pointer relative z-10 shrink-0"
        >
          <Zap className="h-4 w-4" />
          <span>Bridge Skill Gaps</span>
        </button>
      </div>

      {/* ── ERROR ALERT ── */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── 1. TARGET ROLE & OPPORTUNITY SELECTOR ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Target className="h-4 w-4 text-indigo-500" />
            <span>Select Target Career Track / Opportunity</span>
          </h2>
          <span className="text-xs text-slate-400">Live Database Requirements</span>
        </div>

        {opportunities.length === 0 ? (
          <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No active corporate opportunities found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {opportunities.map((opp) => {
              const isSelected = selectedTargetId === opp._id;
              return (
                <button
                  key={opp._id}
                  onClick={() => handleSelectTarget(opp._id)}
                  className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/5'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase">
                        {opp.type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]">{opp.companyName}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{opp.title}</h3>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono line-clamp-2">
                    {(opp.requiredSkills || []).join(' • ')}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. SKILL GAP METRICS & DNA BREAKDOWN ── */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-mono font-bold flex items-center justify-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
          <span>Analyzing Real Skill DNA...</span>
        </div>
      ) : !selectedTargetId ? (
        /* Empty State when no target role is selected */
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Target className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Select a target role to analyze your skill gap.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Choose one of the active target career tracks or opportunity postings above to compare your verified skills.
            </p>
          </div>
        </div>
      ) : (
        /* Active Analysis Content */
        <div className="space-y-6">

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Role Match Card */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Current Role Match</span>
                <div className="flex items-baseline space-x-2 pt-1">
                  <span className="text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {matchPercentage ?? 0}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">compatibility</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Target Role:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {selectedTargetRole?.title || 'Selected Opening'}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Matched Skills:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {matchedSkills.length} / {targetSkills.length}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Missing Gaps:</span>
                  <span className="font-bold text-rose-500">{missingSkills.length} Skills</span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700" 
                  style={{ width: `${matchPercentage ?? 0}%` }} 
                />
              </div>
            </div>

            {/* Missing Skills Card */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-rose-500">
                <AlertTriangle className="h-4 w-4" />
                <h4 className="text-xs font-black uppercase font-mono">Missing Critical Skills</h4>
              </div>

              {missingSkills.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>All required skills present in your profile!</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-bold font-mono">
                      + {s}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Acquiring these missing skills will raise your candidate ranking for this target opening.
              </p>
            </div>

            {/* Weak Skills (Need Proficiency Upgrade) */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-500">
                <TrendingUp className="h-4 w-4" />
                <h4 className="text-xs font-black uppercase font-mono">Weak Skills Requiring Upgrades</h4>
              </div>

              {weakSkills.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-medium">
                  No beginner-level gaps found in this track.
                </div>
              ) : (
                <div className="space-y-2">
                  {weakSkills.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex justify-between items-center font-bold">
                      <span>{s.name}</span>
                      <span className="text-[10px] uppercase font-mono">{s.proficiency} → Intermediate</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Take assessments to elevate your proficiency level from Beginner to Intermediate/Advanced.
              </p>
            </div>

          </div>

          {/* Current Skills & Matched Skills Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Skills */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span>Current Profile Skills ({currentSkills.length})</span>
                </h4>
                <button
                  onClick={() => navigate('/skills')}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Manage Skills
                </button>
              </div>

              {currentSkills.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No skills added to your profile yet.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentSkills.map((sk, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium flex items-center space-x-1"
                    >
                      <span>{sk.name}</span>
                      <span className="text-[9px] uppercase font-bold text-indigo-500">({sk.proficiency.slice(0, 3)})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Matched Skills */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase font-mono text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Matched Skills ({matchedSkills.length})</span>
                </h4>
              </div>

              {matchedSkills.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  None of your current profile skills matched the target opening.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((sk, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── 3. ROADMAP & RECOMMENDED SKILLS ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Compass className="h-4 w-4 text-indigo-500" />
                  <span>Recommended Skills to Learn</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Priority skills extracted from active corporate job postings in the database.
                </p>
              </div>

              <button
                onClick={() => navigate('/skills')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>Assess Skills</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {recommendedSkills.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No extra recommendations needed — your profile matches all target prerequisites!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {recommendedSkills.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400">Phase {idx + 1}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        item.priority === 'High' 
                          ? 'bg-rose-500/10 text-rose-600 font-bold' 
                          : 'bg-indigo-500/10 text-indigo-600'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.skill}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
