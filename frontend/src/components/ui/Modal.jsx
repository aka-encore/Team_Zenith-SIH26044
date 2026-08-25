import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`sb-glass-card ${maxWidth} w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 relative bg-slate-950 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {title && (
          <div className="space-y-1 pr-8 text-left">
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        )}

        <div className="text-left">{children}</div>
      </div>
    </div>
  );
}
