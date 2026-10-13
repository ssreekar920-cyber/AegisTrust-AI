import React from "react";
import { ShieldAlert } from "lucide-react";

export function EmptyState({
  title = "No Data",
  description = "No items to display at this time.",
  icon: Icon = ShieldAlert,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 ${className}`}
    >
      <div className="p-3 mb-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
