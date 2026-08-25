import React from 'react';

export function SkillBadge({
  name,
  category,
  level = 0,
  variant = 'default',
  className = ''
}) {
  const getStatusColor = (lvl) => {
    if (lvl === 0) return "bg-slate-800 text-slate-400 border-slate-700";
    if (lvl >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (lvl >= 60) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (lvl >= 40) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border font-mono ${getStatusColor(level)} ${className}`}>
      <span>{name}</span>
      {level > 0 && <span className="font-bold">({level}%)</span>}
    </span>
  );
}

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  color = "bg-blue-500",
  height = "h-2",
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono font-bold text-white">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full ${color} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value = 0,
  size = 96,
  strokeWidth = 6,
  label = "Readiness Score",
  className = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="text-slate-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="none"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-blue-500 transition-all duration-500 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">{value}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
    </div>
  );
}
