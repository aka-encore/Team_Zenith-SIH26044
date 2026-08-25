import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:bg-blue-700",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:bg-slate-850",
    violet: "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 active:bg-purple-700",
    outline: "bg-transparent hover:bg-slate-900 text-slate-300 border border-slate-700 hover:text-white",
    ghost: "bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-xs sm:text-sm px-4 py-2.5 gap-2",
    lg: "text-sm sm:text-base px-6 py-3.5 gap-2.5 font-semibold"
  };

  return (
    <button
      disabled={isDisabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
