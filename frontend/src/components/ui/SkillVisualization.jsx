import React from 'react';
import { EmptyState, SkeletonCard, ErrorState } from './EmptyState';
import { ProgressBar } from './SkillBadge';
import { Sparkles, Dna } from 'lucide-react';

export function SkillVisualization({
  skills = [],
  isLoading = false,
  isError = false,
  errorMessage = "Failed to load skill intelligence data.",
  onRetry,
  onSelectSkill,
  selectedSkillName,
  className = ''
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (!skills || skills.length === 0) {
    return (
      <EmptyState
        title="No skill data available yet"
        description="Analytics and skill DNA mapping will appear here once student assessments or code repositories are submitted."
        icon={Dna}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skills.map((item, idx) => {
          const gap = Math.max(0, (item.demand || 0) - (item.level || 0));
          const isSelected = selectedSkillName === item.name;

          return (
            <div
              key={idx}
              onClick={() => onSelectSkill && onSelectSkill(item)}
              className={`sb-glass-card p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
                isSelected ? 'border-blue-500 ring-1 ring-blue-500/40 bg-slate-900' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{item.category || 'General'}</span>
                  <h4 className="text-base font-bold text-white">{item.name}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {gap}% Gap
                </span>
              </div>

              <div className="space-y-2">
                <ProgressBar label="Student Mastery" value={item.level || 0} color="bg-blue-500" />
                <ProgressBar label="Industry Demand" value={item.demand || 0} color="bg-purple-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
