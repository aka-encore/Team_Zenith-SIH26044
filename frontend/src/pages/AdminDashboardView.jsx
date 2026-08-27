import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, Users, Building2, GraduationCap, School, Briefcase,
  CheckCircle2, XCircle, AlertCircle, Sparkles, Filter, RefreshCw,
  Search, Lock, Layers, BarChart3, ChevronRight, HelpCircle, Plus,
  Trash2, Edit3, Check, X, Code2, Award, Zap, Loader2
} from 'lucide-react';


const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];


export default function AdminDashboardView() {
  const { token, user } = useAuth();
  
  // Tab State: 'users' | 'questions'
  const [activeTab, setActiveTab] = useState('users');

  // Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    faculty: 0,
    companies: 0,
    admins: 0,
    pendingCompanies: 0,
    opportunities: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // ── Assessment Questions State (Admin) ──
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionSkillFilter, setQuestionSkillFilter] = useState('All');
  const [questionDiffFilter, setQuestionDiffFilter] = useState('All');
  const [questionSearch, setQuestionSearch] = useState('');
  
  // Question Modal State
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
  const [questionError, setQuestionError] = useState('');

  // Fetch admin dashboard stats & user list
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Questions for Admin
  const fetchAdminQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/questions/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setQuestionsList(data.questions || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchAdminQuestions();
  }, [token]);

  // Approve / Reject / Toggle Status
  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg(`User status updated to "${newStatus}".`);
        fetchAdminData();
        setTimeout(() => setActionMsg(''), 3500);
      }
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  // Open Create Question Modal
  const openCreateQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      skill: 'JavaScript',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'Medium',
      explanation: ''
    });
    setQuestionError('');
    setQuestionModalOpen(true);
  };

  // Handle Save Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setQuestionError('');

    if (!questionForm.skill.trim()) {
      setQuestionError('Skill name is required.');
      return;
    }

    if (!questionForm.question.trim()) {
      setQuestionError('Question text is required.');
      return;
    }

    const filledOptions = questionForm.options.map(o => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      setQuestionError('Please provide at least 2 non-empty options.');
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
          skill: questionForm.skill.trim(),
          question: questionForm.question.trim(),
          options: filledOptions,
          correctAnswer: questionForm.correctAnswer,
          difficulty: questionForm.difficulty,
          explanation: questionForm.explanation.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save question.');
      }

      setQuestionModalOpen(false);
      setActionMsg(editingQuestion ? 'Question updated in MongoDB!' : 'Question created in MongoDB!');
      fetchAdminQuestions();
      setTimeout(() => setActionMsg(''), 3500);
    } catch (err) {
      setQuestionError(err.message || 'Error saving question.');
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/questions/${qId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg('Question deleted from MongoDB.');
        fetchAdminQuestions();
        setTimeout(() => setActionMsg(''), 3500);
      }
    } catch (err) {
      console.error('Delete question error:', err);
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = !searchQuery || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filtered Questions
  const filteredQuestions = questionsList.filter(q => {
    const matchesSkill = questionSkillFilter === 'All' || q.skill.toLowerCase() === questionSkillFilter.toLowerCase();
    const matchesDiff = questionDiffFilter === 'All' || q.difficulty === questionDiffFilter;
    const matchesSearch = !questionSearch || q.question.toLowerCase().includes(questionSearch.toLowerCase());
    return matchesSkill && matchesDiff && matchesSearch;
  });

  const uniqueSkillsInDb = ['All', ...Array.from(new Set(questionsList.map(q => q.skill)))];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HEADER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Admin Super Control Hub</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            System Administration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Manage user roles, company approvals, and technical assessment question banks stored in MongoDB.
          </p>
        </div>

        <div className="flex items-center space-x-2 relative z-10">
          {activeTab === 'questions' && (
            <button
              onClick={openCreateQuestionModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Question</span>
            </button>
          )}

          <button
            onClick={() => { fetchAdminData(); fetchAdminQuestions(); }}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            title="Refresh from MongoDB"
          >
            <RefreshCw className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── ACTION ALERT ── */}
      {actionMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg('')} className="p-1 hover:text-emerald-900 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Registered Users", val: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Students", val: stats.students, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Partner Companies", val: stats.companies, icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Assessment Questions", val: questionsList.length, icon: HelpCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{kpi.label}</span>
              <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* ── ADMIN TABS ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Directory & Approvals ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 px-2 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'questions'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Assessment Question Bank ({questionsList.length})</span>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 1: USERS DIRECTORY ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-900 dark:text-white focus:border-rose-500 transition font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              {['all', 'student', 'faculty', 'company', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer ${
                    roleFilter === r
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase font-mono font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 font-mono">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                          u.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {u.status === 'pending' ? (
                          <button
                            onClick={() => handleUpdateStatus(u._id, 'active')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition shadow-xs cursor-pointer"
                          >
                            Approve Account
                          </button>
                        ) : u.role !== 'admin' ? (
                          <button
                            onClick={() => handleUpdateStatus(u._id, u.status === 'active' ? 'suspended' : 'active')}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">Super Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 2: QUESTIONS MANAGEMENT ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'questions' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search question text..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-900 dark:text-white focus:border-emerald-500 transition font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              {/* Skill Filter */}
              <select
                value={questionSkillFilter}
                onChange={(e) => setQuestionSkillFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none cursor-pointer"
              >
                {uniqueSkillsInDb.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Skills' : s}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={questionDiffFilter}
                onChange={(e) => setQuestionDiffFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none cursor-pointer"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions Cards List */}
          {loadingQuestions ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-500">Loading questions from MongoDB...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
              <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">No assessment questions found</h3>
              <p className="text-xs text-slate-500">Create a question using the button above.</p>
              <button
                onClick={openCreateQuestionModal}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
              >
                Create Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q._id}
                  className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-black uppercase">
                          {q.skill}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black uppercase ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : q.difficulty === 'Hard'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswer;

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center space-x-2.5 ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-500 uppercase font-mono block text-[10px]">Technical Explanation</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ CREATE / EDIT QUESTION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Create Assessment Question</h3>
                  <p className="text-xs text-slate-500">Add questions into MongoDB with hidden answer keys.</p>
                </div>
              </div>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {questionError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 font-bold rounded-xl flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{questionError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Skill <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, Python, Docker"
                    value={questionForm.skill}
                    onChange={(e) => setQuestionForm({ ...questionForm, skill: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Difficulty <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter the technical question prompt..."
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Answer Options & Correct Answer <span className="text-rose-500">*</span>
                </label>

                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setQuestionForm({ ...questionForm, correctAnswer: idx })}
                      className={`w-7 h-7 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 transition cursor-pointer ${
                        questionForm.correctAnswer === idx
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300'
                      }`}
                      title={`Click to mark option ${String.fromCharCode(65 + idx)} as correct answer`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </button>

                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500"
                    />

                    {questionForm.correctAnswer === idx && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                        (Correct)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Technical Explanation (Shown after submission)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the correct answer is right for student learning..."
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  {savingQuestion ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Saving…</span></>
                  ) : (
                    <><Check className="h-3.5 w-3.5" /><span>Save Question</span></>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
