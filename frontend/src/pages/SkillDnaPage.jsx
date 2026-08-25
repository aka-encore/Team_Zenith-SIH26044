import React, { useState } from 'react';
import { 
  Dna, Sparkles, ArrowRight, BookOpen, CheckCircle2, ChevronRight, 
  Layers, Cpu, Shield, ExternalLink, Zap, Info, X
} from 'lucide-react';

export default function SkillDnaPage() {
  const [selectedSkill, setSelectedSkill] = useState({
    name: "React",
    category: "Frontend Architecture",
    level: 82,
    demand: 91,
    gap: 9,
    status: "Minor Gap",
    color: "from-cyan-500 to-blue-600",
    prerequisites: ["ES6 JavaScript", "DOM & Virtual DOM", "HTML5/CSS3"],
    recommendedModules: [
      "Advanced React Patterns & Custom Hooks",
      "Component Testing with React Testing Library & Jest",
      "Performance Optimization & Code Splitting"
    ],
    projectIdea: "Build an Enterprise Analytics Dashboard with real-time WebSocket state management.",
    companiesDemanding: ["TechNova", "CloudScale", "DataSphere", "InnoTech"]
  });

  const skillMatrix = [
    {
      name: "React",
      category: "Frontend Architecture",
      level: 82,
      demand: 91,
      gap: 9,
      status: "Minor Gap",
      color: "from-cyan-500 to-blue-600",
      prerequisites: ["ES6 JavaScript", "DOM & Virtual DOM", "HTML5/CSS3"],
      recommendedModules: [
        "Advanced React Patterns & Custom Hooks",
        "Component Testing with React Testing Library & Jest",
        "Performance Optimization & Code Splitting"
      ],
      projectIdea: "Build an Enterprise Analytics Dashboard with real-time WebSocket state management.",
      companiesDemanding: ["TechNova", "CloudScale", "DataSphere"]
    },
    {
      name: "Node.js & Express",
      category: "Backend Systems",
      level: 75,
      demand: 88,
      gap: 13,
      status: "Moderate Gap",
      color: "from-emerald-500 to-teal-600",
      prerequisites: ["Async JS & Promises", "HTTP Protocols", "JSON API Design"],
      recommendedModules: [
        "Microservices Architecture with Node.js",
        "JWT Authentication & RBAC Security",
        "Redis Caching & Queue Processing"
      ],
      projectIdea: "Design a Scalable E-commerce API backend with rate-limiting and Redis caching.",
      companiesDemanding: ["TechNova", "Apex Systems", "CyberShield"]
    },
    {
      name: "Cloud Architecture (AWS)",
      category: "DevOps & Infrastructure",
      level: 45,
      demand: 88,
      gap: 43,
      status: "Critical Gap",
      color: "from-rose-500 to-amber-600",
      prerequisites: ["Linux Command Line", "Basic Networking", "Git"],
      recommendedModules: [
        "AWS EC2, S3 & IAM Core Essentials",
        "Docker Containerization & Multi-stage Builds",
        "CI/CD Pipeline Setup with GitHub Actions"
      ],
      projectIdea: "Deploy a Containerized Microservices App with automated CI/CD pipeline on AWS.",
      companiesDemanding: ["CloudScale Labs", "TechNova", "InnoTech"]
    },
    {
      name: "Data Structures & Algorithms",
      category: "Computer Science Core",
      level: 64,
      demand: 94,
      gap: 30,
      status: "Critical Gap",
      color: "from-amber-500 to-orange-600",
      prerequisites: ["Time Complexity Analysis", "Arrays & String Manipulation"],
      recommendedModules: [
        "Graph Traversal & Shortest Path Algorithms",
        "Dynamic Programming Masterclass",
        "System Design Fundamentals"
      ],
      projectIdea: "Solve 50 curated LeetCode Medium/Hard algorithmic challenges.",
      companiesDemanding: ["Google", "Amazon", "TechNova", "DataSphere"]
    },
    {
      name: "MongoDB & NoSQL",
      category: "Data Engineering",
      level: 78,
      demand: 80,
      gap: 2,
      status: "Industry Ready",
      color: "from-emerald-400 to-green-600",
      prerequisites: ["Relational Database Basics", "JSON Documents"],
      recommendedModules: [
        "MongoDB Aggregation Pipeline Optimization",
        "Indexing Strategies for High Throughput",
        "Vector Search & AI Integration"
      ],
      projectIdea: "Implement a hybrid Vector Search engine with MongoDB Atlas.",
      companiesDemanding: ["DataSphere", "CloudScale", "InnoTech"]
    },
    {
      name: "AI & LLM Integration",
      category: "Emerging Tech",
      level: 58,
      demand: 85,
      gap: 27,
      status: "High Growth Gap",
      color: "from-purple-500 to-indigo-600",
      prerequisites: ["Python / JS Basics", "API Endpoints"],
      recommendedModules: [
        "Prompt Engineering & LangChain Framework",
        "Retrieval-Augmented Generation (RAG) Architecture",
        "Fine-tuning Open-Source LLMs"
      ],
      projectIdea: "Create an AI Knowledge Base Assistant with RAG pipeline.",
      companiesDemanding: ["DataSphere", "CyberShield", "TechNova"]
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* PAGE HEADER */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium flex items-center space-x-1.5">
              <Dna className="h-3.5 w-3.5 text-purple-400" />
              <span>SkillNexus AI Skill DNA Engine</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Interactive Skill DNA Matrix</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Click on any skill node below to inspect real-time industry demand vs student mastery, identified gaps, and AI-curated learning roadmaps.
          </p>
        </div>
      </div>

      {/* MATRIX & DETAIL SIDE PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SKILL GRID (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-slate-400">
              Active Mapped Competencies ({skillMatrix.length})
            </h3>
            <span className="text-xs text-slate-400">Select card to view detailed learning path</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillMatrix.map((item, idx) => {
              const isSelected = selectedSkill.name === item.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSkill(item)}
                  className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900/90 shadow-lg shadow-indigo-500/10' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">{item.category}</span>
                      <h4 className="text-lg font-bold text-white">{item.name}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.gap > 30 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      item.gap > 10 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Dual Bar (Current Level vs Industry Demand) */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Your Mastery</span>
                        <span className="font-mono font-bold">{item.level}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.level}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Industry Demand</span>
                        <span className="font-mono">{item.demand}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-500" style={{ width: `${item.demand}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Skill Gap: <strong className="text-rose-400 font-mono">{item.gap}%</strong></span>
                    <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                      <span>Inspect</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED INSPECTOR PANEL */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-indigo-400 font-mono font-bold block">AI Skill Inspector</span>
                  <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
                </div>
              </div>
              <span className="text-xs text-slate-400">{selectedSkill.category}</span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Your Level</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">{selectedSkill.level}%</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Industry</span>
                <span className="text-lg font-bold text-indigo-400 font-mono">{selectedSkill.demand}%</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Skill Gap</span>
                <span className="text-lg font-bold text-rose-400 font-mono">{selectedSkill.gap}%</span>
              </div>
            </div>

            {/* Recommended Learning Path */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>Recommended Learning Modules</span>
              </h4>
              <div className="space-y-2">
                {selectedSkill.recommendedModules.map((mod, m) => (
                  <div key={m} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Capstone Project */}
            <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 space-y-2">
              <div className="text-xs font-bold text-indigo-300 flex items-center space-x-1">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Recommended Capstone Project</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                "{selectedSkill.projectIdea}"
              </p>
            </div>

            {/* Companies Demanding This Skill */}
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block mb-2">Hiring Enterprise Partners:</span>
              <div className="flex flex-wrap gap-2">
                {selectedSkill.companiesDemanding.map((comp, c) => (
                  <span key={c} className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
