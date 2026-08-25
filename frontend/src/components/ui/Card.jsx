import React from 'react';

export function Card({
  children,
  className = '',
  interactive = false,
  ...props
}) {
  return (
    <div
      className={`sb-glass-card rounded-2xl p-5 border border-slate-800 ${
        interactive ? 'sb-glass-card-interactive cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-slate-800/80 mb-4 ${className}`}>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 border-t border-slate-800/80 mt-4 text-xs text-slate-400 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  trend,
  className = ''
}) {
  // If value is null, undefined or 0, render 0 accurately
  const displayVal = value !== undefined && value !== null ? value : 0;

  return (
    <Card className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-blue-400" />}
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
          {displayVal}
        </span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>
      {subtitle ? (
        <p className="text-[11px] text-slate-400">{subtitle}</p>
      ) : displayVal === 0 ? (
        <p className="text-[11px] text-slate-500 italic">No data recorded yet</p>
      ) : null}
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
          trend.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {trend.value}
        </span>
      )}
    </Card>
  );
}
