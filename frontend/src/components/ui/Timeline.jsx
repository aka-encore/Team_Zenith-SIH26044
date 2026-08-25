import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export function Timeline({ steps = [], className = '' }) {
  if (steps.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
        No roadmap timeline steps generated yet.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'Completed';
        const isInProgress = step.status === 'In Progress';

        return (
          <div key={idx} className="flex items-start space-x-3 text-xs">
            <div className="mt-0.5">
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : isInProgress ? (
                <Clock className="h-4 w-4 text-blue-400 animate-pulse shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-600 shrink-0" />
              )}
            </div>
            <div className="flex-1 pb-3 border-b border-slate-800/80">
              <div className="flex justify-between items-center">
                <span className={`font-bold ${isCompleted ? 'text-emerald-300' : isInProgress ? 'text-blue-300' : 'text-slate-400'}`}>
                  {step.title}
                </span>
                {step.duration && <span className="font-mono text-[11px] text-slate-500">{step.duration}</span>}
              </div>
              {step.description && <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
