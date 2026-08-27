import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2, Layers, Server, Cpu, Terminal, Zap, Database,
  CheckCircle2, AlertCircle, Loader2, Sparkles, Clock,
  ArrowRight, ArrowLeft, RefreshCw, Award, Check, X,
  ShieldCheck, HelpCircle, Flame, BarChart3, ChevronRight,
  Plus, Edit3, Trash2, Search, Filter, Play, Target
} from 'lucide-react';


const ICON_MAP = {
  'JavaScript': Code2,
  'React': Layers,
  'Node.js': Server,
  'Python': Cpu,
  'Java': Terminal,
  'C++': Zap,
  'MongoDB': Database
};

const COLOR_MAP = {
  'JavaScript': { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'React': { text: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  'Node.js': { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'Python': { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'Java': { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'C++': { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'MongoDB': { text: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' }
};

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const PROFICIENCY_BADGES = {
  'Beginner': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700', segments: 1 },
  'Intermediate': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', segments: 2 },
  'Advanced': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', segments: 3 },
  'Expert': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', segments: 4 }
};

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'AI & ML', 'Core CS', 'Tools'];


export default function SkillsAssessmentPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Page Tab: 'skills' | 'assessment' | 'history'
  const [activeTab, setActiveTab] = useState('skills');

  // Test Running State: 'idle' | 'testing' | 'result'
  const [testMode, setTestMode] = useState('idle');

  // ── 1. MY SKILLS STATE ──
  const [skillsList, setSkillsList] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add/Edit Skill Modal State
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Frontend', proficiency: 'Intermediate' });
  const [savingSkill, setSavingSkill] = useState(false);

  // ── 2. ASSESSMENT STATE ──
  const [catalog, setCatalog] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [selectedSkillItem, setSelectedSkillItem] = useState(null);
  const [testData, setTestData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loadingTest, setLoadingTest] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(300);
  const [resultData, setResultData] = useState(null);

  // Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Skills from MongoDB
  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const res = await fetch('/api/students/skills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSkillsList(data.skills || []);
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoadingSkills(false);
    }
  };

  // Fetch Assessment Catalog and History from MongoDB
  const fetchCatalogAndHistory = async () => {
    setLoadingCatalog(true);
    try {
      const [catRes, histRes] = await Promise.all([
        fetch('/api/assessment/catalog', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/assessment/history', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const catData = await catRes.json();
      const histData = await histRes.json();

      if (catData.success) setCatalog(catData.catalog || []);
      if (histData.success) setHistory(histData.history || []);
    } catch (err) {
      console.error('Error fetching assessment data:', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSkills();
      fetchCatalogAndHistory();
    }
  }, [token]);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (testMode === 'testing' && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testMode, timeLeftSeconds]);

  // ── SKILL CRUD HANDLERS ──
  const openAddSkill = () => {
    setEditingSkillId(null);
    setSkillForm({ name: '', category: 'Frontend', proficiency: 'Intermediate' });
    setSkillModalOpen(true);
  };

  const openEditSkill = (skill) => {
    setEditingSkillId(skill._id);
    setSkillForm({
      name: skill.name || '',
      category: skill.category || 'Frontend',
      proficiency: skill.proficiency || 'Intermediate'
    });
    setSkillModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      setErrorMsg('Skill name is required.');
      return;
    }

    setSavingSkill(true);
    setErrorMsg('');
    try {
      const url = editingSkillId ? `/api/students/skills/${editingSkillId}` : '/api/students/skills';
      const method = editingSkillId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: skillForm.name.trim(),
          category: skillForm.category,
          proficiency: skillForm.proficiency
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save skill.');

      setSkillsList(data.skills || []);
      setSkillModalOpen(false);
      setSuccessMsg(editingSkillId ? 'Skill updated in MongoDB!' : 'Skill added to MongoDB!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving skill.');
    } finally {
      setSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      const res = await fetch(`/api/students/skills/${skillId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSkillsList(data.skills || []);
        setSuccessMsg('Skill removed from MongoDB.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg('Error deleting skill.');
    }
  };

  // ── ASSESSMENT HANDLERS ──
  const startAssessment = async (skillItem) => {
    setSelectedSkillItem(skillItem);
    setLoadingTest(true);
    setErrorMsg('');
    setUserAnswers({});
    setCurrentQIndex(0);

    try {
      const res = await fetch(`/api/assessment/questions?skill=${encodeURIComponent(skillItem.name)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load test questions.');

      setTestData(data);
      setTimeLeftSeconds((data.durationMinutes || 5) * 60);
      setTestMode('testing');
    } catch (err) {
      setErrorMsg(err.message || 'Error retrieving questions.');
    } finally {
      setLoadingTest(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitAssessment = async () => {
    if (!testData) return;
    setSubmittingTest(true);
    setErrorMsg('');

    const totalSeconds = (testData.durationMinutes || 5) * 60;
    const timeTaken = Math.max(1, totalSeconds - timeLeftSeconds);

    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill: testData.skill,
          answers: userAnswers,
          timeTakenSeconds: timeTaken
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit test.');

      setResultData(data.result);
      setTestMode('result');
      fetchSkills();
      fetchCatalogAndHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Error scoring assessment.');
    } finally {
      setSubmittingTest(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Filter skills
  const filteredSkills = skillsList.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HERO BANNER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Skill Matrix & Dynamic Certification Engine</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Skills & Assessment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Manage your technical competencies, take timed domain skill assessments, and earn verified skill levels stored in MongoDB.
          </p>
        </div>

        <div className="flex items-center space-x-2 relative z-10">
          {activeTab === 'skills' && (
            <button
              onClick={openAddSkill}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </button>
          )}

          {activeTab === 'assessment' && testMode === 'idle' && (
            <button
              onClick={() => setActiveTab('history')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition"
            >
              <span>View History ({history.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ── ALERTS ── */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:text-emerald-900 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:text-rose-900 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ── 3 PRIMARY TABS ── */}
      {testMode === 'idle' && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold pb-px">
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-3 px-2 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'skills'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>Tab 1: My Skills ({skillsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`pb-3 px-2 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'assessment'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Tab 2: Skill Assessment ({catalog.length} Tests)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-2 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Tab 3: Assessment History ({history.length})</span>
          </button>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 1: MY SKILLS ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'skills' && testMode === 'idle' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          {loadingSkills ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-400">Loading skills from MongoDB...</span>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="glass-card p-12 sm:p-16 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
              <Code2 className="h-10 w-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No skills added yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add your primary programming languages, frameworks, databases, and technical tools.
                </p>
              </div>
              <button
                onClick={openAddSkill}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition"
              >
                Add Your First Skill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => {
                const badge = PROFICIENCY_BADGES[skill.proficiency] || PROFICIENCY_BADGES['Intermediate'];

                return (
                  <div
                    key={skill._id}
                    className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 flex flex-col justify-between hover:shadow-lg transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">{skill.name}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">{skill.category || 'General'}</span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase font-mono border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {skill.proficiency || 'Intermediate'}
                        </span>
                      </div>

                      {/* Segmented Progress Indicator */}
                      <div className="grid grid-cols-4 gap-1 pt-2">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={`h-1.5 rounded-full ${
                              seg <= badge.segments ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          const catItem = catalog.find(c => c.name.toLowerCase() === skill.name.toLowerCase());
                          if (catItem) {
                            setActiveTab('assessment');
                            startAssessment(catItem);
                          } else {
                            setActiveTab('assessment');
                          }
                        }}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Assess Skill</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button onClick={() => openEditSkill(skill)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteSkill(skill._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 2: SKILL ASSESSMENT (SELECTION / LIVE TEST) ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'assessment' && testMode === 'idle' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalog.map((item) => {
              const Icon = ICON_MAP[item.name] || Code2;
              const theme = COLOR_MAP[item.name] || { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
              const pastAttempts = history.filter(h => h.skill.toLowerCase() === item.name.toLowerCase());
              const latest = pastAttempts[0];

              return (
                <div
                  key={item.id}
                  className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 border ${theme.border}`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {latest ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black font-mono">
                          {latest.skillLevel || latest.proficiencyEarned} ({latest.percentage || latest.scorePercentage}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                          Not Tested
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{item.name}</h3>
                      <span className="text-xs font-bold text-slate-400">{item.category}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                      <span>{item.durationMinutes} Mins</span>
                      <span>•</span>
                      <span>{item.questionsCount} Questions</span>
                    </div>
                  </div>

                  <button
                    onClick={() => startAssessment(item)}
                    disabled={loadingTest}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loadingTest && selectedSkillItem?.id === item.id ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Preparing Test…</span></>
                    ) : (
                      <><span>Start Assessment</span><ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ── LIVE INTERACTIVE TEST TAKING ENVIRONMENT ── */}
      {testMode === 'testing' && testData && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 font-black">
                {testData.skill}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Timed Evaluation</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Question {currentQIndex + 1} of {testData.totalQuestions}
                </h3>
              </div>
            </div>

            <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border font-mono font-black text-sm ${
              timeLeftSeconds <= 60
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${((currentQIndex + 1) / testData.totalQuestions) * 100}%` }}
            />
          </div>

          {(() => {
            const q = testData.questions[currentQIndex];
            const currentSelected = userAnswers[q.id];

            return (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase">Question #{currentQIndex + 1}</span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-relaxed">{q.question}</h2>
                </div>

                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = currentSelected === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 font-bold text-xs rounded-xl"
                  >
                    Previous
                  </button>

                  {currentQIndex === testData.totalQuestions - 1 ? (
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={submittingTest}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                    >
                      {submittingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span>{submittingTest ? 'Calculating Score...' : 'Submit Assessment'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQIndex(prev => Math.min(testData.totalQuestions - 1, prev + 1))}
                      className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* ── TEST RESULTS VIEW ── */}
      {testMode === 'result' && resultData && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Award className="h-8 w-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {resultData.skill} Assessment Results
              </h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your score and assigned skill level have been calculated and saved to MongoDB.
              </p>
            </div>

            {/* 6 Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Total</span>
                <span className="text-2xl font-black font-mono">{resultData.totalQuestions}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Correct</span>
                <span className="text-2xl font-black font-mono text-emerald-600">{resultData.correctAnswers}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Wrong</span>
                <span className="text-2xl font-black font-mono text-rose-500">{resultData.wrongAnswers}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Score</span>
                <span className="text-2xl font-black font-mono text-indigo-500">{resultData.score} / {resultData.totalQuestions}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Percentage</span>
                <span className="text-2xl font-black font-mono text-emerald-600">{resultData.percentage}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Skill Level</span>
                <span className="text-xs font-black font-mono uppercase text-amber-500 block pt-1">{resultData.skillLevel}</span>
              </div>
            </div>

            {/* Threshold Pill */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono font-bold text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">0-39 Beginner</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">40-59 Intermediate</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">60-79 Advanced</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">80-100 Expert</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setTestMode('idle')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
              >
                Back to Skills & Assessments
              </button>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black">Detailed Answer Review</h3>
            <div className="space-y-3">
              {resultData.userAnswers?.map((ans, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${ans.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'} text-xs space-y-1`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-slate-400">Question #{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ans.isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                      {ans.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{ans.questionText}</h4>
                  {ans.explanation && <p className="text-slate-600 dark:text-slate-400 text-[11px] pt-1">{ans.explanation}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 3: ASSESSMENT HISTORY ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'history' && testMode === 'idle' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Past Assessment Attempts in MongoDB</h3>
              <span className="text-xs font-mono font-bold text-slate-400">{history.length} Records</span>
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                No past assessments found. Take a test from Tab 2.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-mono font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Skill</th>
                      <th className="p-3 text-center">Total</th>
                      <th className="p-3 text-center">Correct</th>
                      <th className="p-3 text-center">Wrong</th>
                      <th className="p-3 text-center">Score</th>
                      <th className="p-3 text-center">Percentage</th>
                      <th className="p-3 text-center">Skill Level</th>
                      <th className="p-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {history.map((h) => (
                      <tr key={h._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{h.skill}</td>
                        <td className="p-3 text-center font-mono">{h.totalQuestions || 5}</td>
                        <td className="p-3 text-center font-mono text-emerald-600">{h.correctAnswers || 0}</td>
                        <td className="p-3 text-center font-mono text-rose-500">{h.wrongAnswers !== undefined ? h.wrongAnswers : Math.max(0, (h.totalQuestions || 5) - (h.correctAnswers || 0))}</td>
                        <td className="p-3 text-center font-mono text-indigo-500">{h.score !== undefined ? h.score : h.correctAnswers} / {h.totalQuestions || 5}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-600">{h.percentage || h.scorePercentage}%</td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {h.skillLevel || h.proficiencyEarned}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ ADD/EDIT SKILL MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {skillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black">{editingSkillId ? 'Edit Skill' : 'Add New Skill'}</h3>
              <button onClick={() => setSkillModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="e.g. React, Node.js, Python"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Category</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Proficiency Level</label>
                <select
                  value={skillForm.proficiency}
                  onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 cursor-pointer font-bold"
                >
                  {PROFICIENCY_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setSkillModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={savingSkill} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md">
                  {savingSkill ? 'Saving...' : 'Save Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
