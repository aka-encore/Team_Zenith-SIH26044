import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Zap, Target, BookOpen, Briefcase, Award, 
  CheckCircle2, TrendingUp, Cpu, Building2, Users, ChevronRight, 
  BarChart3, ShieldCheck, Star, Layers, Compass, BrainCircuit, Rocket
} from 'lucide-react';

export default function HomePage({ onSelectTab }) {
  const navigate = useNavigate();

  const handleCTA = (view) => {
    if (onSelectTab) {
      onSelectTab(view);
    } else {
      navigate(`/${view}`);
    }
  };

  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8 px-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>AI-Powered Academia × Industry Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Where Student Skills <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Meet Industry Demand.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Discover opportunities, identify your skill gaps, build industry-ready skills and connect with top companies through our smart skill mapping matrix.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleCTA('skill-dna')}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <span>Check My Skill Gap</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleCTA('opportunities')}
              className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold px-8 py-4 rounded-xl text-base border border-slate-700/80 transition-all duration-200 backdrop-blur-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Briefcase className="h-5 w-5 text-indigo-400" />
              <span>Explore Opportunities</span>
            </button>
          </div>

          {/* VISUAL HERO DIAGRAM PIPELINE */}
          <div className="pt-10">
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 text-left relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Live Intelligence Pipeline</h3>
                    <p className="text-xs text-slate-400">SIH26044 Automated Mapping Engine</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-time Active</span>
                </span>
              </div>

              {/* Pipeline Flow Diagram */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
                {[
                  { step: "01", title: "Student Skills", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  { step: "02", title: "AI Skill Analysis", icon: Cpu, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                  { step: "03", title: "Industry Demand", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                  { step: "04", title: "Personalized Learning", icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                  { step: "05", title: "Internship", icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { step: "06", title: "Placement", icon: Award, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl bg-slate-900/90 border ${item.border} flex flex-col justify-between h-32 relative group hover:border-slate-600 transition-all`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{item.step}</span>
                      <div className={`p-1.5 rounded-md ${item.bg} ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{item.title}</p>
                    </div>
                    {idx < 5 && (
                      <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 z-10 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PLATFORM STATISTICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[
              { label: "Active Students", value: "12,450+", icon: Users, sub: "Mapped Across Departments" },
              { label: "Partner Companies", value: "320+", icon: Building2, sub: "Recruiting Active Talent" },
              { label: "Live Opportunities", value: "1,850+", icon: Briefcase, sub: "Internships & Projects" },
              { label: "Match Accuracy", value: "94%", icon: Target, sub: "AI Skill Algorithm" }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 rounded-xl border border-slate-800/80 text-left">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">{stat.label}</span>
                  <stat.icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: HOW THE PLATFORM WORKS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">Architectural Workflow</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">How the Platform Works</h3>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            A closed-loop intelligence engine driving synergy between academic curriculum and enterprise demand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Continuous Skill Mapping",
              desc: "Students upload project repositories, test scores, and credentials. Our AI maps verified competencies to a dynamic Skill DNA.",
              icon: BrainCircuit,
              badge: "For Students"
            },
            {
              num: "02",
              title: "Real-Time Demand Sensing",
              desc: "Companies publish stack requirements and live problem statements, creating an up-to-the-minute Industry Demand Index.",
              icon: TrendingUp,
              badge: "For Companies"
            },
            {
              num: "03",
              title: "Automated Curriculum & Placement",
              desc: "Colleges leverage gap heatmaps to update elective syllabi, deploy micro-credentials, and stream job-ready candidates to hirers.",
              icon: Layers,
              badge: "For Colleges"
            }
          ].map((card, i) => (
            <div key={i} className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-extrabold font-mono text-indigo-400/80">{card.num}</span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">{card.badge}</span>
                </div>
                <div className="p-3 bg-indigo-500/10 w-fit rounded-xl text-indigo-400 mb-4">
                  <card.icon className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{card.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: AI SKILL GAP ANALYSIS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Deep Diagnostics
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Precision AI Skill Gap Diagnostics
              </h3>
              <p className="text-slate-300 text-base leading-relaxed">
                Traditional resumes hide true engineering potential. Our AI analyzes codebase depth, algorithmic performance, and theoretical mastery to compute precise skill vectors.
              </p>
              <ul className="space-y-3">
                {[
                  "Granular skill breakdown across 140+ tech & domain verticals",
                  "Automated gap calculation against 300+ live job descriptions",
                  "Actionable weekly roadmap recommendations to bridge missing 15-20%"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCTA('skill-dna')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <span>Launch Skill DNA Diagnostics</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Preview Mockup */}
            <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                <span className="font-semibold text-white">Student Skill Radar Preview</span>
                <span className="text-indigo-400">Alex Chen (3rd Yr CS)</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "React / Frontend", level: 85, demand: 90, gap: 5, color: "bg-indigo-500" },
                  { name: "Node.js & Express", level: 75, demand: 88, gap: 13, color: "bg-purple-500" },
                  { name: "Cloud Architecture (AWS)", level: 42, demand: 85, gap: 43, color: "bg-rose-500" },
                  { name: "Data Structures & Algo", level: 68, demand: 95, gap: 27, color: "bg-amber-500" }
                ].map((skill, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{skill.name}</span>
                      <span className="font-mono">Current: {skill.level}% | Target: {skill.demand}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className={`h-full ${skill.color}`} style={{ width: `${skill.level}%` }} />
                      <div className="h-full bg-slate-700 opacity-60" style={{ width: `${skill.gap}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                <span>AI Recommendation: Focus on Cloud Architecture + Docker</span>
                <span className="text-emerald-400 font-bold">+18% Match Boost</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INDUSTRY SKILL DEMAND */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">Market Intelligence</h2>
            <h3 className="text-3xl font-bold text-white">Live Industry Skill Demand</h3>
          </div>
          <button
            onClick={() => handleCTA('industry-demand')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Full Market Heatmap</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { skill: "Cloud Native & Kubernetes", growth: "+42%", demand: "High", deficit: "45% Supply Gap", icon: Cpu },
            { skill: "AI / LLM Integration", growth: "+68%", demand: "Very High", deficit: "52% Supply Gap", icon: BrainCircuit },
            { skill: "Fullstack Next.js & React", growth: "+24%", demand: "High", deficit: "20% Supply Gap", icon: Layers },
            { skill: "DevOps & CI/CD Pipelines", growth: "+35%", demand: "High", deficit: "38% Supply Gap", icon: Zap }
          ].map((item, i) => (
            <div key={i} className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {item.growth} YoY
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{item.skill}</h4>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Demand: <strong className="text-slate-200">{item.demand}</strong></span>
                <span className="text-rose-400 font-semibold">{item.deficit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: SMART INTERNSHIP MATCHING */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass-card p-8 rounded-3xl border border-slate-800 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-2xl text-purple-400">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-3xl font-bold text-white">Smart Weighted Internship Matching</h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            No more manual application spam. Our matching algorithm evaluates candidate skill vectors against employer technical specs to deliver precise candidate-opportunity compatibility scores.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => handleCTA('opportunities')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition flex items-center space-x-2 cursor-pointer"
            >
              <Briefcase className="h-4 w-4" />
              <span>Browse Matches for Your Profile</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: ACADEMIA-INDUSTRY COLLABORATION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Core Differentiator
            </span>
            <h3 className="text-3xl font-bold text-white">Academia × Industry Lab</h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Bridging the gap between static college syllabi and fast-paced industry requirements. Colleges receive automated syllabus revision recommendations based on live enterprise needs.
            </p>
            <button
              onClick={() => handleCTA('academia-lab')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold px-6 py-3 rounded-xl text-sm border border-emerald-500/30 transition flex items-center space-x-2 cursor-pointer"
            >
              <span>Explore Academia × Industry Lab</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curriculum Alignment Matrix</div>
            <div className="space-y-3">
              {[
                { module: "CS302: Web Development", status: "Syllabus Update Recommended", score: "62% Modern Match", color: "text-amber-400" },
                { module: "CS401: Cloud Systems", status: "Industry Certified Track", score: "94% Modern Match", color: "text-emerald-400" },
                { module: "IT204: Database Systems", status: "Add NoSQL & Vector DB", score: "71% Modern Match", color: "text-indigo-400" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-white">{item.module}</div>
                    <div className="text-slate-400">{item.status}</div>
                  </div>
                  <span className={`font-mono font-bold ${item.color}`}>{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: STUDENT SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">Proven Impact</h2>
          <h3 className="text-3xl font-bold text-white">Student Success Stories</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Priya Sharma",
              college: "IIT Bombay - Computer Science",
              placedAt: "Backend Engineer @ TechNova",
              quote: "The Skill DNA tool showed me my exact cloud gap. Following the recommended AWS roadmap helped me land my dream internship in 6 weeks!",
              score: "96% Skill Match"
            },
            {
              name: "Rohan Verma",
              college: "NIT Trichy - Information Technology",
              placedAt: "Fullstack Intern @ CloudScale",
              quote: "Our college used the Academia Lab insights to launch a Microservices bootcamp. 80% of our batch secured industry roles.",
              score: "92% Skill Match"
            },
            {
              name: "Ananya Patel",
              college: "BITS Pilani - Electronics",
              placedAt: "AI Engineer @ DataSphere",
              quote: "Instead of sending 50 generic resumes, the platform matched me with 3 high-fit opportunities based on my verified ML projects.",
              score: "94% Skill Match"
            }
          ].map((story, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, s) => <Star key={s} className="h-4 w-4 fill-amber-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">"{story.quote}"</p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-white">{story.name}</h5>
                  <p className="text-[11px] text-slate-400">{story.college}</p>
                  <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">{story.placedAt}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">{story.score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: TRUSTED INDUSTRY PARTNERS */}
      <section className="max-w-7xl mx-auto px-4 text-center">
        <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Trusted By 320+ Industry Leaders & Institutions</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {["TechNova", "CloudScale Labs", "DataSphere", "CyberShield", "Apex Systems", "InnoTech Enterprise"].map((partner, p) => (
            <div key={p} className="glass-card p-4 rounded-xl border border-slate-800 text-slate-400 font-semibold text-sm flex items-center justify-center space-x-2">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <span>{partner}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass-card p-10 sm:p-16 rounded-3xl border border-indigo-500/30 text-center relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Bridge Your Skill Gap?
            </h3>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Join 12,000+ students and top industry partners. Empower your engineering journey with real-time AI skill intelligence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={() => handleCTA('skill-dna')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-base transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Get Started - Free Skill Mapping</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
