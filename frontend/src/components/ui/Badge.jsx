import React from "react";

export function Badge({ children, variant = "neutral", className = "" }) {
  const variants = {
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
    cyan: "bg-cyan-950/70 text-cyan-300 border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]",
    danger: "bg-rose-950/70 text-rose-300 border-rose-800/60 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
    success: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    warning: "bg-amber-950/70 text-amber-300 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
