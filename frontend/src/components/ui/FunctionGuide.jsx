import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

/**
 * Reusable Operational Guidelines Component embedded at the bottom of each function page.
 * Provides clear step-by-step instructions, operational rules, and pro-tips.
 */
export function FunctionGuide({
  moduleName,
  badge = "STEP-BY-STEP WORKFLOW",
  color = "#06b6d4",
  steps = [],
  proTips = [],
  defaultExpanded = true,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className="mt-12 rounded-2xl bg-[#080e1e]/90 border border-slate-800/90 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-md transition-all duration-300"
      style={{
        borderColor: expanded ? `${color}40` : "rgba(30, 41, 59, 0.8)",
      }}
    >
      {/* Clickable Header Banner */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl flex items-center justify-center border shrink-0"
            style={{
              backgroundColor: `${color}15`,
              borderColor: `${color}50`,
              color: color,
            }}
          >
            <BookOpen className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">
                How to Use: {moduleName}
              </h3>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border hidden sm:inline-block"
                style={{
                  backgroundColor: `${color}15`,
                  borderColor: `${color}40`,
                  color: color,
                }}
              >
                {badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard operating guidelines, execution steps, and verification procedures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 hidden md:inline-block">
            {expanded ? "Collapse Guidelines" : "Expand Guidelines"}
          </span>
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Guidelines Body */}
      {expanded && (
        <div className="p-6 pt-4 border-t border-slate-800/80 space-y-6 animate-fadeIn">
          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-extrabold tracking-wider border"
                      style={{
                        backgroundColor: `${color}15`,
                        borderColor: `${color}40`,
                        color: color,
                      }}
                    >
                      STEP {step.num || `0${idx + 1}`}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mb-1.5 leading-snug">
                    {step.heading}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {step.detail}
                  </p>
                </div>

                {step.tip && (
                  <div className="mt-3 pt-2.5 border-t border-slate-900 text-[10px] text-slate-400 font-mono flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pro Tips / Operational Notes */}
          {proTips && proTips.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400 shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <strong className="text-amber-300 font-mono font-semibold tracking-wide uppercase text-[11px]">
                  SecOps Best Practices & Operational Rules:
                </strong>
                <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1 font-sans">
                  {proTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FunctionGuide;
