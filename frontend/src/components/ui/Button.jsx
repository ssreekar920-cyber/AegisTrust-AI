import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  icon: Icon,
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const variants = {
    primary:
      "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold focus:ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)]",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-400",
    outline:
      "border border-cyan-500/50 hover:bg-cyan-950/40 text-cyan-400 focus:ring-cyan-500",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-[0_0_16px_rgba(239,68,68,0.25)]",
    ghost:
      "hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
