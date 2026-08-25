import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';


export function Toast({
  type = 'info',
  message,
  onClose,
  className = ''
}) {

  const styles = {
    info: { icon: Info, color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    success: { icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    error: { icon: AlertCircle, color: "text-rose-400 border-rose-500/20 bg-rose-500/10" }
  };


  const current = styles[type] || styles.info;
  const IconComponent = current.icon;


  return (
    <div className={`sb-glass-card p-4 rounded-xl border flex items-center space-x-3 text-xs text-slate-200 shadow-lg ${current.color} ${className}`}>
      <IconComponent className="h-4 w-4 shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}


export function Tooltip({ text, children }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-md whitespace-nowrap shadow-md pointer-events-none">
        {text}
      </div>
    </div>
  );
}


export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-white transition">{item.label}</a>
          ) : (
            <span className="text-slate-200 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
