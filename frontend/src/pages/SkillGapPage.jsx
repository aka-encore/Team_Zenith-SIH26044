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
  const [learningRoadmap, setLearningRoadmap] = useState([]);
  const [industryDemandComparison, setIndustryDemandComparison] = useState([]);
  const [targetSkills, setTargetSkills] = useState([]);

  // ── WHAT-IF SIMULATOR STATE (IN-MEMORY ONLY) ──
  const [selectedSimulatedSkill, setSelectedSimulatedSkill] = useState('');

  // Reusable skill match calculation helper (exact formula from backend matchingEngine)
  const calculateMatch = (skillsList, opp) => {
    if (!opp) return { matchPercentage: 0, matchedSkills: [], missingSkills: [] };
    
    const sSkills = (skillsList || []).map(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase().trim()).filter(Boolean);
    const sSet = new Set(sSkills);

    const req = Array.isArray(opp.requiredSkills)
      ? opp.requiredSkills
      : (typeof opp.requiredSkills === 'string' ? opp.requiredSkills.split(',') : []);

    const cleanReq = req.map(s => (typeof s === 'string' ? s : s?.name || '').trim()).filter(Boolean);

    if (cleanReq.length === 0) {
      return { matchPercentage: 100, matchedSkills: [], missingSkills: [], totalRequired: 0 };
    }

    const matched = cleanReq.filter(r => sSet.has(r.toLowerCase().trim()));
    const missing = cleanReq.filter(r => !sSet.has(r.toLowerCase().trim()));
    const matchPercentage = Math.round((matched.length / cleanReq.length) * 100);

    return {
      matchPercentage,
      matchedSkills: matched,
      missingSkills: missing,
      totalRequired: cleanReq.length
    };
  };

  // Extract all candidate missing/weak skills for simulation
  const baseStudentSkills = currentSkills.map(s => (typeof s === 'string' ? s : s?.name || ''));
  const selectableMissingSkills = (() => {
    const studentSkillNames = new Set(
      currentSkills.map(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase().trim())
    );
    const missingSet = new Set();
    const list = [];

    // 1. Missing skills from currently selected target role
    missingSkills.forEach(sk => {
      const norm = sk.toLowerCase().trim();
      if (!missingSet.has(norm) && !studentSkillNames.has(norm)) {
        missingSet.add(norm);
        list.push(sk);
      }
    });

    // 2. Weak skills from currently selected target role
    weakSkills.forEach(w => {
      const sk = typeof w === 'string' ? w : w?.name;
      if (sk) {
        const norm = sk.toLowerCase().trim();
        if (!missingSet.has(norm)) {
          missingSet.add(norm);
          list.push(sk);
        }
      }
    });

    // 3. Additional missing skills from other active opportunities
    opportunities.forEach(opp => {
      (opp.requiredSkills || []).forEach(sk => {
        if (sk) {
          const norm = sk.toLowerCase().trim();
          if (!missingSet.has(norm) && !studentSkillNames.has(norm)) {
            missingSet.add(norm);
            list.push(sk.trim());
          }
        }
      });
    });

    return list;
  })();

  // Real in-memory What-If calculation results (zero MongoDB writes)
  const whatIfResults = (() => {
    if (!selectedSimulatedSkill) return null;

    const simulatedSkills = [...baseStudentSkills, selectedSimulatedSkill];

    // 1. Target Opportunity Impact
    let targetBefore = null;
    let targetAfter = null;
    let newlyMatchedInTarget = [];

    if (selectedTargetRole) {
      targetBefore = calculateMatch(baseStudentSkills, selectedTargetRole);
      targetAfter = calculateMatch(simulatedSkills, selectedTargetRole);
      newlyMatchedInTarget = targetAfter.matchedSkills.filter(
        sk => !targetBefore.matchedSkills.some(m => m.toLowerCase().trim() === sk.toLowerCase().trim())
      );
    }

    // 2. Calculate impact across all active opportunities
    const improvedOpportunities = [];
    opportunities.forEach(opp => {
      const before = calculateMatch(baseStudentSkills, opp);
      const after = calculateMatch(simulatedSkills, opp);

      if (after.matchPercentage > before.matchPercentage) {
        const newlyMatched = after.matchedSkills.filter(
          sk => !before.matchedSkills.some(m => m.toLowerCase().trim() === sk.toLowerCase().trim())
        );

        improvedOpportunities.push({
          oppId: opp._id,
          title: opp.title,
          companyName: opp.companyName,
          type: opp.type,
          location: opp.location,
          beforeMatch: before.matchPercentage,
          afterMatch: after.matchPercentage,
          boost: after.matchPercentage - before.matchPercentage,
          newlyMatchedSkills: newlyMatched,
          totalRequired: opp.requiredSkills?.length || 0
        });
      }
    });

    improvedOpportunities.sort((a, b) => b.boost - a.boost);

    return {
      simulatedSkill: selectedSimulatedSkill,
      targetBefore: targetBefore?.matchPercentage ?? 0,
      targetAfter: targetAfter?.matchPercentage ?? 0,
      targetBoost: (targetAfter?.matchPercentage ?? 0) - (targetBefore?.matchPercentage ?? 0),
      newlyMatchedInTarget,
      improvedOpportunities
    };
  })();
  
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
      setIndustryDemandComparison(data.industryDemandComparison || []);
      
      if (targetId && data.hasTargetSelected) {
        setMatchPercentage(data.matchPercentage);
        setMatchedSkills(data.matchedSkills || []);
        setMissingSkills(data.missingSkills || []);
        setWeakSkills(data.weakSkills || []);
        setRecommendedSkills(data.recommendedSkills || []);
        setLearningRoadmap(data.learningRoadmap || []);
        setTargetSkills(data.targetSkills || []);
        setSelectedTargetRole(data.selectedOpportunity || null);
      } else {
        setMatchPercentage(null);
        setMatchedSkills([]);
        setMissingSkills([]);
        setWeakSkills([]);
        setRecommendedSkills([]);
        setLearningRoadmap([]);
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
            setIndustryDemandComparison(data.industryDemandComparison || []);
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
              Select a target role to generate your roadmap.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Select a target role or open corporate opportunity above to analyze your skill gap and generate your personalized learning roadmap.
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
                <h4 className="text-xs font-black uppercase font-mono">Missing Skills</h4>
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
                Critical missing competencies required by the target job opening.
              </p>
            </div>

            {/* Weak Skills (Need Proficiency Upgrade) */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-500">
                <TrendingUp className="h-4 w-4" />
                <h4 className="text-xs font-black uppercase font-mono">Weak Skills</h4>
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
                Skills currently evaluated below target requirements.
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

          {/* ── 3. CAREER WHAT-IF SIMULATOR (IN-MEMORY ONLY) ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-[#0f172a] shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            {/* Header & Simulator Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 font-mono font-extrabold uppercase tracking-wider flex items-center space-x-1 shadow-xs">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span>In-Memory Sandbox</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Zero Database Writes</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <span>Career What-If Simulator</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a missing or weak skill to simulate in real time how your opportunity match scores and hiring readiness improve across live employer postings.
                </p>
              </div>

              {selectedSimulatedSkill && (
                <button
                  onClick={() => setSelectedSimulatedSkill('')}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
                >
                  Reset Simulation
                </button>
              )}
            </div>

            {/* Selectable Missing / Weak Skills Chips */}
            <div className="space-y-2.5 relative z-10">
              <label className="text-xs font-black uppercase font-mono text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <span>Select One Missing Skill to Simulate:</span>
                {selectedSimulatedSkill && (
                  <span className="text-purple-600 dark:text-purple-400 font-bold lowercase">
                    (simulating: <strong>{selectedSimulatedSkill}</strong>)
                  </span>
                )}
              </label>

              {selectableMissingSkills.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs text-center font-medium">
                  No missing skills detected for simulation. Add more corporate opportunities or adjust your target role.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectableMissingSkills.map((skillName, idx) => {
                    const isSelected = selectedSimulatedSkill.toLowerCase() === skillName.toLowerCase();
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSimulatedSkill(isSelected ? '' : skillName)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold font-mono transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105 border-2 border-purple-400'
                            : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20'
                        }`}
                      >
                        <span>{isSelected ? '★' : '+'}</span>
                        <span>{skillName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Simulation Results Display */}
            {whatIfResults ? (
              <div className="space-y-6 pt-2 relative z-10 animate-in fade-in duration-300">
                
                {/* Before vs After Match Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Match Boost Score Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-purple-500/30 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Target Role Match</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                        whatIfResults.targetBoost > 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {whatIfResults.targetBoost > 0 ? `+${whatIfResults.targetBoost}% Match Boost` : 'No direct target match increase'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                      <div>
                        <span className="text-xs text-slate-400 font-mono block">Before</span>
                        <span className="text-2xl font-black font-mono text-slate-700 dark:text-slate-300">
                          {whatIfResults.targetBefore}%
                        </span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-purple-500 shrink-0" />
                      <div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono block font-bold">After</span>
                        <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                          {whatIfResults.targetAfter}%
                        </span>
                      </div>
                    </div>

                    {/* Comparative Dual Progress Bars */}
                    <div className="space-y-1.5 pt-1 text-[10px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Original: {whatIfResults.targetBefore}%</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Simulated: {whatIfResults.targetAfter}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-slate-400 dark:bg-slate-600 rounded-full absolute top-0 left-0"
                          style={{ width: `${whatIfResults.targetBefore}%` }}
                        />
                        <div 
                          className="h-full bg-emerald-500 rounded-full absolute top-0 left-0 transition-all duration-500"
                          style={{ width: `${whatIfResults.targetAfter}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Newly Matched Skills Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                      Newly Matched Skills
                    </span>

                    {whatIfResults.newlyMatchedInTarget.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs font-medium">
                        Skill not required by {selectedTargetRole?.title || 'the selected opening'}, but improves other postings below!
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {whatIfResults.newlyMatchedInTarget.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-extrabold flex items-center space-x-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{sk} (Now Satisfied)</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      Skill requirement verified as complete under in-memory simulator.
                    </p>
                  </div>

                  {/* Opportunities Boost Summary Card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                      Employer Postings Impacted
                    </span>

                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {whatIfResults.improvedOpportunities.length}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {whatIfResults.improvedOpportunities.length === 1 ? 'Opportunity improved' : 'Opportunities improved'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Total corporate postings where your compatibility score increases by mastering <strong>{selectedSimulatedSkill}</strong>.
                    </p>
                  </div>

                </div>

                {/* Opportunities That Improved Section */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Live Opportunities That Improved ({whatIfResults.improvedOpportunities.length})</span>
                  </h4>

                  {whatIfResults.improvedOpportunities.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-medium">
                      No additional employer postings improved with this specific skill. Try another missing skill.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {whatIfResults.improvedOpportunities.map(opp => (
                        <div
                          key={opp.oppId}
                          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 shadow-xs space-y-3 flex flex-col justify-between hover:border-purple-400/40 transition"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase">
                                {opp.type}
                              </span>
                              <span className="text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                +{opp.boost}% Boost
                              </span>
                            </div>

                            <h5 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                              {opp.title}
                            </h5>
                            <p className="text-xs text-slate-500 font-medium">
                              {opp.companyName} {opp.location ? `• ${opp.location}` : ''}
                            </p>
                          </div>

                          {/* Match Percentage Visual Change */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-400">Match:</span>
                              <span className="font-bold text-slate-600 dark:text-slate-400">{opp.beforeMatch}%</span>
                              <span className="text-purple-500 font-bold">→</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400">{opp.afterMatch}%</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              {opp.newlyMatchedSkills.slice(0, 2).map((sk, idx) => (
                                <span key={idx} className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                  +{sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* Prompt when no skill is selected yet */
              <div className="p-8 text-center rounded-2xl bg-white/60 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 space-y-2 relative z-10">
                <Sparkles className="h-8 w-8 text-purple-500 mx-auto animate-pulse" />
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                  Ready to Simulate Career Impact
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click any missing skill pill above to preview how your match percentage immediately increases across real corporate job postings.
                </p>
              </div>
            )}
          </div>

          {/* ── 4. LEARNING ROADMAP (RECOMMENDED LEARNING ORDER) ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-[#0c1222] shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-extrabold uppercase tracking-wider">
                    Dynamic Skill Progression
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Target: <strong className="text-slate-800 dark:text-white">{selectedTargetRole?.title || 'Selected Role'}</strong>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-indigo-500" />
                  <span>Learning Roadmap</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-by-step recommended learning order prioritized from your missing skills, weak proficiencies, and assessment results.
                </p>
              </div>

              <button
                onClick={() => navigate('/skills')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
              >
                <span>Take Skill Assessment</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {learningRoadmap.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                <h4 className="text-sm font-black">All Prerequisites Satisfied!</h4>
                <p className="text-xs opacity-90 max-w-md mx-auto">
                  Your skill profile meets 100% of the competencies required for this role.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">
                  Recommended Learning Order ({learningRoadmap.length} Sequential Steps)
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {learningRoadmap.map((item) => (
                    <div 
                      key={item.step} 
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/40 transition"
                    >
                      <div className="flex items-start sm:items-center space-x-4">
                        {/* Step Number Badge */}
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-xs">
                          {item.step}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                              {item.skill}
                            </h4>
                            
                            {/* Priority Badge */}
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase border ${
                              item.priority === 'High'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                : item.priority === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                            }`}>
                              Priority: {item.priority}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Reason:</span>
                            <span>{item.reason}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
                        <button
                          onClick={() => navigate('/skills')}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Practice / Assess</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 4. INDUSTRY DEMAND COMPARISON ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  <span>Industry Demand Comparison</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real market demand computed across active corporate job postings versus your verified student skill proficiency.
                </p>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Sorted by Market Demand
              </span>
            </div>

            {industryDemandComparison.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-medium">
                Industry demand data is not available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                      <th className="pb-3 font-extrabold">Skill</th>
                      <th className="pb-3 font-extrabold">Industry Demand</th>
                      <th className="pb-3 font-extrabold">Student Skill Level</th>
                      <th className="pb-3 font-extrabold text-right">Skill Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {industryDemandComparison.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                        {/* Skill Name */}
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{item.skill}</span>
                        </td>

                        {/* Industry Demand */}
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold border ${item.demandColor}`}>
                            Demand: {item.demandLevel} ({item.demandCount} {item.demandCount === 1 ? 'Role' : 'Roles'})
                          </span>
                        </td>

                        {/* Student Skill Level */}
                        <td className="py-3.5 font-medium">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                            item.studentLevel === 'Advanced' || item.studentLevel === 'Expert'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : item.studentLevel === 'Intermediate'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : item.studentLevel === 'Beginner'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}>
                            Level: {item.studentLevel}
                          </span>
                        </td>

                        {/* Skill Gap */}
                        <td className="py-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold border ${item.gapColor}`}>
                            Gap: {item.gap}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
