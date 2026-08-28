import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Search, Filter, RefreshCw, AlertCircle, 
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck, 
  Check, X, Eye, Trash2, Edit3, Plus, Code2, 
  GraduationCap, Zap, HelpCircle, Layers, ChevronRight,
  BookOpen, Sparkles, UserCheck, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function AdminAssessmentsPage() {
  const { token, user: currentAdmin } = useAuth();

  // Active Tab: 'questions' | 'results'
  const [activeTab, setActiveTab] = useState('questions');

  // ── Tab 1: Questions State ──
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [refreshingQuestions, setRefreshingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState('');
  
  const [questionSearch, setQuestionSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');

  // Question Modal (Create / Edit)
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    skill: 'JavaScript',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: ''
  });
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Tab 2: Assessment Results State ──
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState('');
  const [resultSearch, setResultSearch] = useState('');
  const [resultSkillFilter, setResultSkillFilter] = useState('All');
  const [resultLevelFilter, setResultLevelFilter] = useState('All');

  // Fetch Questions
  const fetchQuestions = async (isManual = false) => {
    if (isManual) setRefreshingQuestions(true);
    else setLoadingQuestions(true);
    setQuestionError('');

    try {
      const params = new URLSearchParams();
      if (skillFilter !== 'All') params.append('skill', skillFilter);
      if (diffFilter !== 'All') params.append('difficulty', diffFilter);
      if (questionSearch.trim()) params.append('search', questionSearch.trim());

      const res = await fetch(`/api/questions/admin?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load questions.');
      }
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Fetch questions error:', err);
      setQuestionError(err.message || 'Failed to retrieve assessment questions.');
    } finally {
      setLoadingQuestions(false);
      setRefreshingQuestions(false);
    }
  };

  // Fetch Assessment Results
  const fetchResults = async () => {
    setLoadingResults(true);
    setResultsError('');

    try {
      const params = new URLSearchParams();
      if (resultSkillFilter !== 'All') params.append('skill', resultSkillFilter);
      if (resultLevelFilter !== 'All') params.append('skillLevel', resultLevelFilter);
      if (resultSearch.trim()) params.append('search', resultSearch.trim());

      const res = await fetch(`/api/questions/admin/results?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load assessment results.');
      }
      setResults(data.results || []);
    } catch (err) {
      console.error('Fetch results error:', err);
      setResultsError(err.message || 'Failed to retrieve assessment submissions.');
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'questions') {
        fetchQuestions();
      } else {
        fetchResults();
      }
    }
  }, [token, activeTab, skillFilter, diffFilter, resultSkillFilter, resultLevelFilter]);

  // Debounced search for questions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token && activeTab === 'questions') fetchQuestions();
    }, 350);
    return () => clearTimeout(timer);
  }, [questionSearch]);

  // Debounced search for results
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token && activeTab === 'results') fetchResults();
    }, 350);
    return () => clearTimeout(timer);
  }, [resultSearch]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      skill: 'JavaScript',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'Medium',
      explanation: ''
    });
    setFormError('');
    setQuestionModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      skill: q.skill,
      question: q.question,
      options: [...(q.options || ['', '', '', ''])],
      correctAnswer: q.correctAnswer ?? 0,
      difficulty: q.difficulty || 'Medium',
      explanation: q.explanation || ''
    });
    setFormError('');
    setQuestionModalOpen(true);
  };

  // Save Question (Create or Edit)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!questionForm.skill.trim()) {
      setFormError('Skill name is required.');
      return;
    }
    if (!questionForm.question.trim()) {
      setFormError('Question text is required.');
      return;
    }
    const cleanOptions = questionForm.options.map(o => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setFormError('Please provide at least 2 non-empty options.');
      return;
    }

    setSavingQuestion(true);
    try {
      const url = editingQuestion ? `/api/questions/${editingQuestion._id}` : '/api/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...questionForm,
          options: cleanOptions
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save question.');
      }

      setQuestionSuccess(editingQuestion ? 'Question updated successfully!' : 'New question created in MongoDB!');
      setTimeout(() => setQuestionSuccess(''), 4000);
      setQuestionModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error('Save question error:', err);
      setFormError(err.message || 'Error saving question.');
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.filter(q => q._id !== id));
        setQuestionSuccess('Question removed from question bank.');
        setTimeout(() => setQuestionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Delete question error:', err);
      setQuestionError('Failed to delete question.');
    }
  };

  // Unique skills list from questions
  const uniqueSkills = Array.from(new Set(questions.map(q => q.skill).filter(Boolean)));

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
            <Award className="h-7 w-7 text-indigo-500" />
            <span>Assessment & Skill DNA Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage proficiency testing question banks, configure difficulty tiers, and audit candidate test telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {activeTab === 'questions' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          )}

          <button
            onClick={() => activeTab === 'questions' ? fetchQuestions(true) : fetchResults()}
            disabled={refreshingQuestions || loadingResults}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingQuestions || loadingResults ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {questionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{questionSuccess}</span>
        </div>
      )}

      {questionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{questionError}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ NAVIGATION TABS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'questions'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Question Bank Catalog ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'results'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Candidate Assessment Results</span>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 1: QUESTION BANK ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          
          {/* Search & Filters */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search question text or keywords..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Skill Domains</option>
                  {uniqueSkills.map(sk => (
                    <option key={sk} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={diffFilter}
                  onChange={(e) => setDiffFilter(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Difficulty Tiers</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question List */}
          {loadingQuestions ? (
            <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
              <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Question Bank...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Code2 className="h-8 w-8 mx-auto text-slate-400" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No questions found</h3>
              <p className="text-xs text-slate-400">Click "Add Question" to configure new assessment challenges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q, idx) => (
                <div 
                  key={q._id}
                  className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs hover:border-indigo-500/30 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase border border-indigo-500/20">
                          {q.skill}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          q.difficulty === 'Hard' 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          ● {q.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {q.question}
                    </h4>

                    {/* Options list */}
                    <div className="space-y-1.5 text-xs">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctAnswer;
                        return (
                          <div 
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                              isCorrect 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] font-mono uppercase bg-emerald-500 text-white px-1.5 py-0.2 rounded">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 2: CANDIDATE RESULTS ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          
          {/* Results Filters */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name, email, or skill..."
                  value={resultSearch}
                  onChange={(e) => setResultSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={resultSkillFilter}
                  onChange={(e) => setResultSkillFilter(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Assessed Skills</option>
                  {uniqueSkills.map(sk => (
                    <option key={sk} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={resultLevelFilter}
                  onChange={(e) => setResultLevelFilter(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Skill Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-indigo-500" />
                  <span>Student Assessment Records</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Live proficiency metrics recorded upon student test completion
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {results.length} Submissions
              </span>
            </div>

            {loadingResults ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
                <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Results...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-3">
                <GraduationCap className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p>No student assessment submissions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Skill Domain</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Percentage</th>
                      <th className="p-3.5">Skill Level Earned</th>
                      <th className="p-3.5">Assessment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {results.map(r => (
                      <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                        <td className="p-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {r.studentName?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-white block">
                                {r.studentName}
                              </span>
                              <span className="text-slate-400 text-[11px] font-mono">
                                {r.studentEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {r.skill}
                        </td>

                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {r.score} / {r.totalQuestions}
                        </td>

                        <td className="p-3.5">
                          <span className={`font-mono font-bold ${
                            r.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : r.percentage >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {r.percentage}%
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            r.skillLevel === 'Expert'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : r.skillLevel === 'Advanced'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : r.skillLevel === 'Intermediate'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                          }`}>
                            ● {r.skillLevel}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                          {r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
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

      {/* ━━━━━━━━━━━━━━━━━━━━ CREATE / EDIT QUESTION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingQuestion ? 'Edit Assessment Question' : 'Add New Question'}
              </h3>
              <button 
                onClick={() => setQuestionModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              
              {/* Skill & Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Skill Domain</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Python"
                    value={questionForm.skill}
                    onChange={(e) => setQuestionForm({ ...questionForm, skill: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Difficulty Tier</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Question Statement</label>
                <textarea
                  rows={3}
                  placeholder="Enter the assessment challenge statement..."
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Options (Select radio for correct answer):
                </label>
                
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === i}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: i })}
                      className="cursor-pointer text-indigo-600"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[i] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Explanation (Optional)</label>
                <input
                  type="text"
                  placeholder="Why is this answer correct?"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingQuestion ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
