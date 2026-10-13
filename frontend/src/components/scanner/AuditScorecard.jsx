import React from "react";
import SeverityChip from "../dashboard/SeverityChip.jsx";
import { CheckCircle2, XCircle, Copy, RotateCcw, LayoutDashboard, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";

export function AuditScorecard({ report, onRunAgain, onOpenDashboard }) {
  const toast = useToast();
  if (!report) return null;

  const { grade, score, categories = [], vectors = [], recommendations = [], durationMs } = report;

  const gradeColors = {
    A: "border-emerald-500 text-emerald-400 bg-emerald-950/40 shadow-[0_0_24px_rgba(16,185,129,0.3)]",
    B: "border-cyan-500 text-cyan-400 bg-cyan-950/40 shadow-[0_0_24px_rgba(6,182,212,0.3)]",
    C: "border-amber-500 text-amber-400 bg-amber-950/40 shadow-[0_0_24px_rgba(245,158,11,0.3)]",
    D: "border-orange-500 text-orange-400 bg-orange-950/40 shadow-[0_0_24px_rgba(249,115,22,0.3)]",
    F: "border-rose-600 text-rose-500 bg-rose-950/40 shadow-[0_0_24px_rgba(239,68,68,0.3)]",
  };

  const handleCopyReport = () => {
    const text = `AEGISTRUST AI — SECURITY AUDIT SCORECARD
Overall Grade: ${grade} (${score}%)
Evaluated Vectors: ${vectors.length} (${vectors.filter((v) => v.resisted).length} resisted)
Duration: ${(durationMs / 1000).toFixed(1)}s

CATEGORY BREAKDOWN:
${categories.map((c) => `- ${c.name}: ${c.score}% (${c.passed}/${c.total} passed)`).join("\n")}

RECOMMENDATIONS:
${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Security audit report copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Top Score & Category Overview */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#1e293b]">
          {/* Big Grade Ring */}
          <div className="flex items-center gap-5">
            <div
              className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-mono shrink-0 ${
                gradeColors[grade] || gradeColors.C
              }`}
            >
              <span className="text-4xl font-extrabold leading-none">{grade}</span>
              <span className="text-[11px] font-bold mt-1">{score}%</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">AI Security Audit Scorecard</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-cyan-400 border border-slate-700">
                  {vectors.length} VECTORS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Automated evaluation completed across Jailbreak Resistance, Data Leak Prevention, and Roleplay Rigidity.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Report</span>
            </button>
            <button
              type="button"
              onClick={onRunAgain}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Run Again</span>
            </button>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Open in Dashboard</span>
            </button>
          </div>
        </div>

        {/* Category Breakdown Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{cat.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-2">
                <div
                  className={`h-full ${
                    cat.score >= 80 ? "bg-emerald-500" : cat.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {cat.passed} of {cat.total} vectors resisted
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vector Results Table */}
      <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-[#1e293b]">
          <h4 className="text-sm font-bold text-slate-100">Vector Simulation Detailed Results</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 border-b border-[#1e293b] text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3">Vector ID & Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Defense Verdict</th>
                <th className="px-4 py-3">Judge Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {vectors.map((vec) => (
                <tr key={vec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-200">
                    <span className="text-cyan-400 mr-2">{vec.id}</span>
                    <span>{vec.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{vec.category}</td>
                  <td className="px-4 py-3">
                    <SeverityChip severity={vec.severity} />
                  </td>
                  <td className="px-4 py-3">
                    {vec.resisted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> RESISTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> FAILED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-sm truncate" title={vec.why}>
                    {vec.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-bold text-slate-100">Actionable Remediation Guidance</h4>
          </div>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AuditScorecard;
