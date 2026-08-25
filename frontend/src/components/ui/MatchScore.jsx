import React from 'react';
import { Target } from 'lucide-react';

export function MatchScore({
  score = 0,
  showLabel = true,
  size = 'md',
  className = ''
}) {
  const getBadgeStyle = (val) => {
    if (val >= 85) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (val >= 70) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (val >= 50) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-slate-800 text-slate-400 border-slate-700";
  };

  const sizes = {
    sm: "text-xs px-2.5 py-0.5",
    md: "text-xs px-3 py-1 font-semibold",
    lg: "text-sm px-4 py-1.5 font-bold"
  };

  return (
    <div className={`inline-flex items-center space-x-1.5 rounded-full border font-mono ${getBadgeStyle(score)} ${sizes[size]} ${className}`}>
      <Target className="h-3.5 w-3.5 shrink-0" />
      <span>{score}%</span>
      {showLabel && <span className="font-normal text-[10px] uppercase tracking-wider">Match</span>}
    </div>
  );
}
