import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = "No data available yet",
  description = "Information will appear here once data is added or synced with the server.",
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`sb-glass-card rounded-2xl p-8 sm:p-12 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <Icon className="h-8 w-8 text-blue-400/80" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`sb-skeleton rounded-xl ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="sb-glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="pt-3 border-t border-slate-800 flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Failed to load data",
  message = "An error occurred while fetching information from the backend database.",
  onRetry,
  className = ''
}) {
  return (
    <div className={`sb-glass-card rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-300">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
