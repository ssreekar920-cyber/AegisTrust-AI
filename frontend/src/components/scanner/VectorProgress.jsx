import React from "react";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";

export function VectorProgress({ totalVectors = 12, completedCount = 0, currentVectorName = "" }) {
  const percent = Math.round((completedCount / Math.max(totalVectors, 1)) * 100);

  return (
    <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            Running Automated Red-Team Attack Suite ({completedCount} of {totalVectors} vectors completed)
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400">{percent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {currentVectorName && (
        <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Simulating vector: <strong className="text-slate-200">{currentVectorName}</strong>...</span>
        </p>
      )}
    </div>
  );
}

export default VectorProgress;
