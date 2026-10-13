import React from "react";
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, RefreshCw } from "lucide-react";

export function SecurityBadges({ badges = [] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 my-2">
      {badges.map((b, idx) => {
        const text = typeof b === "string" ? b : b.label;
        const type = typeof b === "string" ? "default" : b.type;

        let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
        let Icon = ShieldAlert;

        if (text.includes("BLOCKED") || type === "blocked") {
          badgeStyle = "bg-rose-950/80 text-rose-300 border-rose-700 shadow-[0_0_12px_rgba(239,68,68,0.25)]";
          Icon = ShieldAlert;
        } else if (text.includes("PII Masked") || type === "pii_masked") {
          badgeStyle = "bg-purple-950/80 text-purple-300 border-purple-700 shadow-[0_0_12px_rgba(168,85,247,0.2)]";
          Icon = Lock;
        } else if (text.includes("SANITIZED") || type === "sanitized") {
          badgeStyle = "bg-amber-950/80 text-amber-300 border-amber-700 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
          Icon = AlertTriangle;
        } else if (text.includes("Restored") || type === "restored") {
          badgeStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
          Icon = ShieldCheck;
        } else if (text.includes("Threat Score") || type === "threat_score") {
          badgeStyle = "bg-cyan-950/80 text-cyan-300 border-cyan-700";
          Icon = RefreshCw;
        } else if (text.includes("TOOL DENIED")) {
          badgeStyle = "bg-rose-950/80 text-rose-300 border-rose-700";
          Icon = ShieldAlert;
        }

        return (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${badgeStyle}`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {text}
          </span>
        );
      })}
    </div>
  );
}

export default SecurityBadges;
