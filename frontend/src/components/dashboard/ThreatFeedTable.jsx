import React from "react";
import SeverityChip from "./SeverityChip.jsx";
import { Shield, Eye, Database } from "lucide-react";
import EmptyState from "../ui/EmptyState.jsx";

export function ThreatFeedTable({ threats = [], onInspect, loading }) {
  if (!loading && threats.length === 0) {
    return (
      <EmptyState
        title="No traffic yet"
        description="No traffic yet — run the demo playground or seed the database."
        icon={Shield}
      />
    );
  }

  return (
    <div className="rounded-xl bg-[#0f172a] border border-[#1e293b] overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Live Security Telemetry & Threat Feed</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </h3>
          <p className="text-xs text-slate-400">
            Real-time feed of requests, categorized vulnerabilities, and quarantine decisions
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Showing {threats.length} recent entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/80 border-b border-[#1e293b] text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Attack Type / OWASP</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Raw Snippet</th>
              <th className="px-4 py-3">Action Taken</th>
              <th className="px-4 py-3">Origin</th>
              <th className="px-4 py-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/60">
            {threats.map((row) => {
              const formattedDate = new Date(row.ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formattedDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">{row.attackType}</span>
                      {row.owaspId && (
                        <span className="text-[10px] text-cyan-400 px-1 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                          {row.owaspId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityChip severity={row.severity} />
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={row.payloadRedacted}>
                    {row.payloadRedacted || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        row.action === "blocked"
                          ? "bg-rose-950/80 text-rose-300 border-rose-800"
                          : row.action === "sanitized"
                          ? "bg-amber-950/80 text-amber-300 border-amber-800"
                          : row.action === "masked"
                          ? "bg-purple-950/80 text-purple-300 border-purple-800"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                      }`}
                    >
                      {row.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.source === "seed" ? (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Database className="w-3 h-3 text-slate-600" />
                        <span>seed</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold">live</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onInspect && onInspect(row.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-800 text-slate-300 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ThreatFeedTable;
