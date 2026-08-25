import React from 'react';
import { Check, X } from 'lucide-react';


export function PasswordStrengthMeter({ password = '' }) {

  const requirements = [
    { label: "Minimum 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    { label: "Contains special character (@$!%*?&)", met: /[@$!%*?&]/.test(password) }
  ];


  const metCount = requirements.filter(r => r.met).length;


  let strengthLabel = "Weak";
  let strengthColor = "bg-rose-500";

  if (metCount === 2) {
    strengthLabel = "Fair";
    strengthColor = "bg-amber-500";
  } else if (metCount === 3) {
    strengthLabel = "Good";
    strengthColor = "bg-blue-500";
  } else if (metCount === 4) {
    strengthLabel = "Strong";
    strengthColor = "bg-emerald-500";
  }


  return (
    <div className="space-y-2 pt-1 text-left">

      {/* Strength Bar */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
        <span>Password Strength:</span>
        <span className={`font-mono uppercase text-[10px] px-2 py-0.5 rounded text-white ${strengthColor}`}>
          {strengthLabel}
        </span>
      </div>

      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
        <div className={`h-full transition-all duration-300 ${metCount >= 1 ? strengthColor : 'bg-transparent'}`} style={{ width: '25%' }} />
        <div className={`h-full transition-all duration-300 ${metCount >= 2 ? strengthColor : 'bg-transparent'}`} style={{ width: '25%' }} />
        <div className={`h-full transition-all duration-300 ${metCount >= 3 ? strengthColor : 'bg-transparent'}`} style={{ width: '25%' }} />
        <div className={`h-full transition-all duration-300 ${metCount >= 4 ? strengthColor : 'bg-transparent'}`} style={{ width: '25%' }} />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center space-x-1.5 text-[10px] font-semibold">
            {req.met ? (
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-slate-400 shrink-0" />
            )}
            <span className={req.met ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
