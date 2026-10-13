import React from "react";
import { Activity, ShieldAlert, Lock, Percent, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

export function MetricCards({ summary, loading }) {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse p-5" />
        ))}
      </div>
    );
  }

  const data = summary || {
    totalRequests: 0,
    attacksBlocked: 0,
    piiTokenized: 0,
    trustScore: 100,
    deltas: { requests: 0, attacks: 0 },
  };

  const cards = [
    {
      title: "Total Requests Screened",
      value: data.totalRequests.toLocaleString(),
      icon: Activity,
      delta: data.deltas?.requests,
      color: "cyan",
      subtext: "24-hour inbound traffic volume",
    },
    {
      title: "Attacks Quarantined",
      value: data.attacksBlocked.toLocaleString(),
      icon: ShieldAlert,
      delta: data.deltas?.attacks,
      color: "rose",
      subtext: "OWASP LLM01-LLM07 blocked",
    },
    {
      title: "PII Entities Tokenized",
      value: data.piiTokenized.toLocaleString(),
      icon: Lock,
      color: "purple",
      subtext: "Cryptographically shielded entities",
    },
    {
      title: "System Trust Score",
      value: `${data.trustScore}%`,
      icon: Percent,
      color: "emerald",
      tooltip:
        "Formula: trust = clamp(100 − 100 × Σ(weights) / max(totalRequests,1), 0, 100) where critical=1.0, high=0.75, medium=0.5, low=0.25",
      subtext: "Weighted zero-trust resiliency score",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                {card.title}
                {card.tooltip && (
                  <span className="group relative cursor-help">
                    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400" />
                    <span className="pointer-events-none absolute left-0 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 rounded shadow-xl z-50">
                      {card.tooltip}
                    </span>
                  </span>
                )}
              </span>

              <div
                className={`p-2 rounded-lg border ${
                  card.color === "cyan"
                    ? "bg-cyan-950/70 border-cyan-800 text-cyan-400"
                    : card.color === "rose"
                    ? "bg-rose-950/70 border-rose-800 text-rose-400"
                    : card.color === "purple"
                    ? "bg-purple-950/70 border-purple-800 text-purple-400"
                    : "bg-emerald-950/70 border-emerald-800 text-emerald-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {card.value}
              </span>

              {card.delta !== undefined && (
                <span
                  className={`flex items-center text-xs font-mono font-semibold ${
                    card.delta >= 0 ? "text-cyan-400" : "text-slate-400"
                  }`}
                >
                  {card.delta >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(card.delta)}%
                </span>
              )}
            </div>

            <p className="mt-2 text-[11px] text-slate-500 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}

export default MetricCards;
