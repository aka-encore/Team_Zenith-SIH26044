import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, ArrowLeft, ArrowRight, Play, Send, CheckCircle2,
  AlertCircle, RefreshCw, Terminal, Code2, Layers, Award,
  Sparkles, Check, Copy, Clock, Cpu, FileCode, CheckSquare,
  Square, ShieldCheck, ChevronRight, HelpCircle, Lightbulb
} from 'lucide-react';

export default function CompanyDsaPracticePage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState(searchParams.get('oppId') || '');
  const [activeTopic, setActiveTopic] = useState(searchParams.get('topic') || 'all');
  const [activeDifficulty, setActiveDifficulty] = useState('all'); // 'all' | 'Easy' | 'Medium' | 'Company Level'
  
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(searchParams.get('problemId') || '');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Execution & Submission State
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'submissions'
  const [submissionHistory, setSubmissionHistory] = useState([]);

  // Fetch opportunities and problems from MongoDB
  const fetchPracticeData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const oppsRes = await fetch('/api/opportunities', { headers });
      const oppsData = await oppsRes.json();

      let targetOppId = selectedOppId;
      if (oppsData.success && Array.isArray(oppsData.opportunities) && oppsData.opportunities.length > 0) {
        setOpportunities(oppsData.opportunities);
        if (!targetOppId) {
          targetOppId = oppsData.opportunities[0]._id;
          setSelectedOppId(targetOppId);
        }
      }

      // Fetch problems for this opportunity & topic
      const url = `/api/students/dsa-problems?opportunityId=${targetOppId || ''}&topic=${activeTopic}`;
      const probRes = await fetch(url, { headers });
      const probData = await probRes.json();

      if (probData.success && Array.isArray(probData.problems)) {
        setProblems(probData.problems);
        if (!selectedProblemId && probData.problems.length > 0) {
          setSelectedProblemId(probData.problems[0].id);
          setCode(probData.problems[0].starterCode[language] || probData.problems[0].starterCode.javascript);
        } else if (selectedProblemId) {
          const cur = probData.problems.find(p => p.id === selectedProblemId);
          if (cur) setCode(cur.starterCode[language] || cur.starterCode.javascript);
        }
      }
    } catch (err) {
      console.error('Error fetching DSA practice data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPracticeData();
    }
  }, [token, selectedOppId, activeTopic]);

  // Load real submission history from localStorage for this user
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`zenith_dsa_submissions_${user?.id || 'guest'}`);
      if (saved) {
        setSubmissionHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading submissions:', e);
    }
  }, [user?.id]);

  const selectedOpportunity = opportunities.find(o => o._id === selectedOppId) || opportunities[0] || null;
  const companyName = selectedOpportunity?.companyId?.companyName || selectedOpportunity?.companyName || 'Enterprise Partner';
  const roleTitle = selectedOpportunity?.title || 'Software Development Engineer';

  // Filter problems by difficulty
  const filteredProblems = problems.filter(p => {
    if (activeDifficulty !== 'all' && p.difficulty !== activeDifficulty) return false;
    return true;
  });

  const currentProblem = problems.find(p => p.id === selectedProblemId) || problems[0] || null;

  // Handle Problem Select
  const handleSelectProblem = (prob) => {
    setSelectedProblemId(prob.id);
    setCode(prob.starterCode[language] || prob.starterCode.javascript);
    setTestResult(null);
    setSearchParams({ oppId: selectedOppId, topic: activeTopic, problemId: prob.id });
  };

  // Handle Language Change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (currentProblem?.starterCode?.[newLang]) {
      setCode(currentProblem.starterCode[newLang]);
    }
  };

  // Reset to default starter code
  const handleResetCode = () => {
    if (currentProblem?.starterCode?.[language]) {
      setCode(currentProblem.starterCode[language]);
    }
  };

  // Run Code / Test Execution
  const handleRunCode = async (isSubmit = false) => {
    if (!currentProblem) return;
    if (isSubmit) setSubmitting(true);
    else setRunning(true);

    try {
      const res = await fetch('/api/students/dsa-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: currentProblem.id,
          language,
          code,
          isSubmit,
          opportunityId: selectedOppId
        })
      });

      const data = await res.json();
      setTestResult(data);
      setActiveTab('console');

      if (isSubmit && data.success) {
        const newRecord = {
          id: Date.now().toString(),
          problemId: currentProblem.id,
          problemTitle: currentProblem.title,
          difficulty: currentProblem.difficulty,
          companyTag: companyName,
          language,
          status: data.status || 'Accepted',
          runtimeMs: data.runtimeMs,
          memoryMb: data.memoryMb,
          submittedAt: new Date().toISOString()
        };

        const updatedHistory = [newRecord, ...submissionHistory];
        setSubmissionHistory(updatedHistory);
        try {
          localStorage.setItem(`zenith_dsa_submissions_${user?.id || 'guest'}`, JSON.stringify(updatedHistory));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Execution error:', err);
      setTestResult({
        success: false,
        verdict: 'Execution Error',
        message: 'Network error or server compilation failure.'
      });
    } finally {
      setRunning(false);
      setSubmitting(false);
    }
  };

  const problemSubmissions = submissionHistory.filter(s => s.problemId === currentProblem?.id);
  const totalAcceptedForProblem = problemSubmissions.filter(s => s.status === 'Accepted').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 text-left">
      
      {/* ── TOP HEADER & COMPANY SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <Link to="/company-prep" className="hover:text-purple-600 flex items-center space-x-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Company Preparation</span>
            </Link>
            <span>/</span>
            <span className="text-purple-600 dark:text-purple-400 font-mono">DSA Practice Studio</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Terminal className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            <span>DSA Coding Studio for {companyName}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Difficulty Flow: <strong className="text-emerald-500">Easy</strong> → <strong className="text-amber-500">Medium</strong> → <strong className="text-purple-500">Company Level (Hard)</strong>
          </p>
        </div>

        {/* Real Opportunity Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          <Building2 className="h-4 w-4 text-purple-500" />
          <select
            value={selectedOppId}
            onChange={(e) => {
              setSelectedOppId(e.target.value);
              setSearchParams({ oppId: e.target.value, topic: activeTopic });
            }}
            className="px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 cursor-pointer shadow-xs max-w-[240px] truncate"
          >
            {opportunities.map(opp => (
              <option key={opp._id} value={opp._id}>
                {opp.companyId?.companyName || opp.companyName || 'Company'} ({opp.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TOPIC & DIFFICULTY FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Topic Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'arrays', label: 'Arrays & Two Pointer' },
            { id: 'hashing', label: 'Hash Maps' },
            { id: 'dp', label: 'Dynamic Programming' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTopic(t.id);
                setSearchParams({ oppId: selectedOppId, topic: t.id });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTopic === t.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Difficulty Flow Filter */}
        <div className="flex items-center space-x-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 text-xs font-mono font-bold">
          {['all', 'Easy', 'Medium', 'Company Level'].map(diff => (
            <button
              key={diff}
              onClick={() => setActiveDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeDifficulty === diff
                  ? diff === 'Easy'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black'
                    : diff === 'Medium'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black'
                      : diff === 'Company Level'
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-black'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {diff === 'all' ? 'All Tiers' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* ── PROBLEM CAROUSEL / SELECTOR ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filteredProblems.map((prob) => {
          const isSelected = selectedProblemId === prob.id;
          const isSolved = submissionHistory.some(s => s.problemId === prob.id && s.status === 'Accepted');
          return (
            <button
              key={prob.id}
              onClick={() => handleSelectProblem(prob)}
              className={`p-4 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/10 shadow-md shadow-purple-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                    prob.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : prob.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  }`}>
                    {prob.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{prob.topicLabel}</span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                  {prob.title}
                </h4>
              </div>

              {isSolved && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── SPLIT WORKSPACE: PROBLEM DESCRIPTION (LEFT) & CODE EDITOR (RIGHT) ── */}
      {currentProblem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT PANEL (5 COLS): PROBLEM STATEMENT, EXAMPLES, CONSTRAINTS ── */}
          <div className="lg:col-span-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 space-y-6 max-h-[800px] overflow-y-auto">
            
            {/* Header with Company Tag & Difficulty */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                  <Building2 className="h-3 w-3" />
                  <span>{companyName} Question</span>
                </span>

                <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full ${
                  currentProblem.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : currentProblem.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                }`}>
                  {currentProblem.difficulty}
                </span>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Topic: {currentProblem.topicLabel}
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {currentProblem.title}
              </h2>
            </div>

            {/* Problem Statement */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white">
                Problem Description:
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentProblem.problemStatement}
              </p>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white">
                Examples:
              </h3>
              {currentProblem.examples.map((ex, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                  <div className="text-slate-500 text-[11px] font-bold">Example {idx + 1}:</div>
                  <div><strong className="text-purple-600 dark:text-purple-400">Input:</strong> <span className="text-slate-700 dark:text-slate-300">{ex.input}</span></div>
                  <div><strong className="text-emerald-600 dark:text-emerald-400">Output:</strong> <span className="text-slate-700 dark:text-slate-300">{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="text-[11px] text-slate-500 font-sans pt-1">
                      <em>Explanation:</em> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white">
                Constraints:
              </h3>
              <ul className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                {currentProblem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Real Submission Record for this problem */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
              <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">Your Submissions:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {totalAcceptedForProblem > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">✓ Accepted ({problemSubmissions.length} submissions)</span>
                ) : (
                  <span>{problemSubmissions.length} attempts</span>
                )}
              </span>
            </div>

          </div>

          {/* ── RIGHT PANEL (7 COLS): CODING EDITOR, RUN, SUBMIT & CONSOLE ── */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden flex flex-col justify-between">
            
            {/* Editor Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Language:</span>
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                  {['javascript', 'python', 'cpp', 'java'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                        language === lang
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetCode}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-mono font-bold transition cursor-pointer"
                  title="Reset to starter code"
                >
                  Reset Code
                </button>
              </div>
            </div>

            {/* Code Editor Text Area */}
            <div className="relative bg-[#0b101b] font-mono text-xs text-slate-100 p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                spellCheck="false"
                className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed outline-none resize-y"
                placeholder="Write your code solution here..."
              />
            </div>

            {/* Action Bar (Run Code & Submit) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <Terminal className="h-4 w-4 text-purple-500" />
                <span>Standard Test Suite</span>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => handleRunCode(false)}
                  disabled={running || submitting}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {running ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-purple-500" />}
                  <span>Run Code</span>
                </button>

                <button
                  onClick={() => handleRunCode(true)}
                  disabled={running || submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>

            {/* ── EXECUTION RESULTS CONSOLE / SUBMISSION TABS ── */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-mono font-bold">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`pb-1 transition cursor-pointer ${
                    activeTab === 'console'
                      ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Execution Console
                </button>

                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`pb-1 transition cursor-pointer ${
                    activeTab === 'submissions'
                      ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Submissions ({problemSubmissions.length})
                </button>
              </div>

              {activeTab === 'console' && (
                <div>
                  {!testResult ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-mono">
                      Click "Run Code" to test with standard cases, or "Submit Solution" to verify against the complete suite.
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-xs animate-in fade-in">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {testResult.verdict}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                          <span>Runtime: <strong className="text-slate-700 dark:text-slate-300">{testResult.runtimeMs} ms</strong></span>
                          <span>Memory: <strong className="text-slate-700 dark:text-slate-300">{testResult.memoryMb}</strong></span>
                        </div>
                      </div>

                      {/* Test Cases Results */}
                      <div className="space-y-2">
                        {(testResult.testResults || []).map((tr, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                            <div className="flex justify-between items-center text-slate-500 font-bold">
                              <span>Test Case #{tr.testCaseIndex}</span>
                              <span className="text-emerald-500 font-bold">✓ Passed</span>
                            </div>
                            <div>Input: <code className="text-slate-700 dark:text-slate-300">{tr.input}</code></div>
                            <div>Output: <code className="text-emerald-600 dark:text-emerald-400">{tr.actualOutput}</code></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-2">
                  {problemSubmissions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-mono">
                      No submissions recorded yet for this problem.
                    </div>
                  ) : (
                    problemSubmissions.map(sub => (
                      <div key={sub.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{sub.status}</span>
                          <span className="text-[10px] text-slate-400 uppercase">({sub.language})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.runtimeMs}ms • {new Date(sub.submittedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
