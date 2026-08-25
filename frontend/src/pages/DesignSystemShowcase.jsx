import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input, Select, SearchBar } from '../components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter, StatCard } from '../components/ui/Card';
import { SkillBadge, ProgressBar, ProgressRing } from '../components/ui/SkillBadge';
import { MatchScore } from '../components/ui/MatchScore';
import { Table, Tabs } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Toast, Tooltip, Breadcrumbs } from '../components/ui/Toast';
import { EmptyState, Skeleton, SkeletonCard, ErrorState } from '../components/ui/EmptyState';
import { Timeline } from '../components/ui/Timeline';
import { SkillVisualization } from '../components/ui/SkillVisualization';
import { 
  Sparkles, Layers, Search, RefreshCw, Briefcase, Award, 
  Dna, Cpu, Building2, AlertCircle, Info, CheckCircle2 
} from 'lucide-react';

export default function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState('states');
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Real Data Rule Demo states
  const [simulatedState, setSimulatedState] = useState('success'); // 'loading' | 'success' | 'empty' | 'error'

  const sampleSkills = simulatedState === 'empty' ? [] : [
    { name: 'React', category: 'Frontend', level: 85, demand: 90 },
    { name: 'Node.js', category: 'Backend', level: 75, demand: 88 },
    { name: 'AWS Cloud', category: 'DevOps', level: 45, demand: 88 },
    { name: 'Data Structures', category: 'CS Core', level: 64, demand: 95 }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="sb-glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold uppercase tracking-wider flex items-center space-x-1.5 font-mono">
              <Dna className="h-3.5 w-3.5" />
              <span>SkillBridge Component Library</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Design System & Component Library</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Official design language for **SkillBridge** (*"Connecting student potential with industry demand"*). Supports 4 strict data states with zero fake metrics.
          </p>
        </div>

        {/* State Toggle Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          {['loading', 'success', 'empty', 'error'].map((st) => (
            <button
              key={st}
              onClick={() => setSimulatedState(st)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                simulatedState === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Design System Component Library' }]} />

      {/* COMPONENT SECTIONS */}
      <div className="space-y-12">

        {/* 1. BUTTONS & INPUTS */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <span>1. Buttons & Form Controls</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Button Variants */}
            <Card className="space-y-4 text-left">
              <CardHeader title="Button Variants & Sizes" subtitle="Accessible focus rings & loading spinner states" />
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md">Primary Button</Button>
                <Button variant="secondary" size="md">Secondary</Button>
                <Button variant="violet" size="md">Violet Accent</Button>
                <Button variant="outline" size="md">Outline</Button>
                <Button variant="ghost" size="md">Ghost</Button>
                <Button variant="danger" size="md">Danger</Button>
                <Button variant="primary" size="md" isLoading>Saving...</Button>
              </div>
            </Card>

            {/* Input & Search Controls */}
            <Card className="space-y-4 text-left">
              <CardHeader title="Form Inputs & Search Controls" subtitle="Error feedback and clearable search bars" />
              <div className="space-y-3">
                <Input label="Student Email Address" placeholder="alex.chen@university.edu" />
                <Select label="Academic Department" options={['Computer Science', 'Information Tech', 'Electronics', 'Data Science']} />
                <SearchBar
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue('')}
                  placeholder="Search skills, opportunities or companies..."
                />
              </div>
            </Card>
          </div>
        </section>

        {/* 2. REAL DATA RULE & DATA STATES (4 STATES) */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span>2. Strict 4-Data States Demo (State: {simulatedState.toUpperCase()})</span>
          </h3>

          {simulatedState === 'loading' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {simulatedState === 'error' && (
            <ErrorState
              title="Database Connection Timeout"
              message="Failed to synchronize student skill vectors from the Express/MongoDB server."
              onRetry={() => setSimulatedState('success')}
            />
          )}

          {simulatedState === 'empty' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard label="Total Active Opportunities" value={0} subtitle="No active job posts in database" />
              <EmptyState
                title="No opportunities available yet"
                description="Internships and industry projects will appear here once partner companies publish openings."
              />
            </div>
          )}

          {simulatedState === 'success' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Placement Readiness" value={78} unit="%" subtitle="Targeting 85% Target" trend={{ isPositive: true, value: "+6%" }} />
              <StatCard label="Verified Skills" value={6} unit="Competencies" subtitle="Mapped via Github" />
              <StatCard label="Matched Internships" value={14} unit="Positions" subtitle=">80% Skill Fit" />
              <StatCard label="Upcoming Tests" value={2} unit="Assessments" subtitle="Scheduled for this week" />
            </div>
          )}
        </section>

        {/* 3. SKILL BADGES & METRICS */}
        <section className="space-y-4 text-left">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Award className="h-5 w-5 text-emerald-400" />
            <span>3. Skill Badges, Match Score & Progress Meters</span>
          </h3>

          <Card className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <SkillBadge name="React" level={85} />
              <SkillBadge name="Node.js" level={75} />
              <SkillBadge name="Cloud AWS" level={45} />
              <SkillBadge name="Unassessed Skill" level={0} />
              <MatchScore score={95} />
              <MatchScore score={72} />
              <MatchScore score={38} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-3">
                <ProgressBar label="React Mastery" value={85} color="bg-blue-500" />
                <ProgressBar label="AWS Cloud Infrastructure" value={45} color="bg-rose-500" />
              </div>
              <div className="flex justify-around items-center">
                <ProgressRing value={78} label="Student Placement Readiness" />
                <ProgressRing value={92} label="Profile Completeness" />
              </div>
            </div>
          </Card>
        </section>

        {/* 4. TABLES & TIMELINES */}
        <section className="space-y-4 text-left">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Briefcase className="h-5 w-5 text-amber-400" />
            <span>4. Accessible Data Tables & Career Timelines</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Table
                columns={[
                  { header: 'Competency', accessor: 'name' },
                  { header: 'Category', accessor: 'category' },
                  { header: 'Mastery Level', render: (row) => <span className="font-mono text-blue-400 font-bold">{row.level}%</span> },
                  { header: 'Industry Demand', render: (row) => <span className="font-mono text-purple-400">{row.demand}%</span> }
                ]}
                data={sampleSkills}
                isLoading={simulatedState === 'loading'}
                emptyMessage="No skills mapped for this student profile."
              />
            </div>

            <Card className="space-y-4">
              <CardHeader title="AI Recommended Roadmap" subtitle="Personalized career steps" />
              <Timeline steps={[
                { title: "AWS Fundamentals", duration: "1 Week", status: "Completed", description: "EC2 & IAM setup" },
                { title: "Docker Containerization", duration: "2 Weeks", status: "In Progress", description: "Multi-stage Dockerfiles" },
                { title: "CI/CD Deployment", duration: "1 Week", status: "Next", description: "GitHub Actions workflow" }
              ]} />
            </Card>
          </div>
        </section>

        {/* 5. INTERACTIVE OVERLAYS & TOAST TRIGGER */}
        <section className="space-y-4 text-left">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Info className="h-5 w-5 text-indigo-400" />
            <span>5. Overlays, Modals & Toast Triggers</span>
          </h3>

          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              Open Test Modal Dialog
            </Button>

            <Button variant="violet" onClick={() => setToastMessage("SkillBridge API successfully synced!")}>
              Trigger Toast Notification
            </Button>
          </div>

          {toastMessage && (
            <div className="max-w-md">
              <Toast type="success" message={toastMessage} onClose={() => setToastMessage(null)} />
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="SkillBridge System Dialog"
            subtitle="Accessible overlay component demo"
          >
            <p className="text-xs text-slate-300 leading-relaxed">
              This reusable Modal primitive supports keyboard traps, esc key dismissal, backdrop blur, and accessible focus management.
            </p>
            <div className="pt-4 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                Understood
              </Button>
            </div>
          </Modal>
        </section>

      </div>
    </div>
  );
}
