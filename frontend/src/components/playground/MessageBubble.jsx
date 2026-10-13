import React from "react";
import SecurityBadges from "./SecurityBadges.jsx";
import { ShieldAlert, ShieldCheck, User, Bot, ArrowRight, FileSearch } from "lucide-react";

export function MessageBubble({ message, isProtected = false, onInspectIncident }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-cyan-950/40 border border-cyan-800/60 text-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-cyan-400 font-semibold">
            <User className="w-3.5 h-3.5" />
            <span>User Input</span>
          </div>
          <p className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant / Gateway Response
  const isBlocked = message.blocked || message.action === "blocked";

  return (
    <div className="flex flex-col items-start mb-6 w-full">
      {/* Animated Scan Strip (Protected pane only) */}
      {isProtected && (
        <div className="w-full max-w-[90%] mb-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono relative overflow-hidden">
          {/* Subtle animated scanline */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-scanline pointer-events-none" />
          
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-semibold">Scanning</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className={isBlocked ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                {isBlocked ? "Quarantine Decision" : "Sanitize & Mask Decision"}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300">Verified Response</span>
            </div>

            {message.latencyMs && (
              <span className="text-slate-500">{message.latencyMs}ms</span>
            )}
          </div>
        </div>
      )}

      {/* Badges Row */}
      {isProtected && message.badges && message.badges.length > 0 && (
        <SecurityBadges badges={message.badges} />
      )}

      {/* Reply Container */}
      {isBlocked ? (
        <div className="w-full max-w-[90%] rounded-2xl p-4 bg-rose-950/30 border-2 border-rose-600/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-rose-800/40">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              <span>Request quarantined by AegisTrust</span>
            </div>
            {message.incidentId && (
              <button
                type="button"
                onClick={() => onInspectIncident && onInspectIncident(message.incidentId)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/60 text-xs font-mono text-rose-200 transition-colors"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Forensics & Auto-Patch</span>
              </button>
            )}
          </div>

          <p className="text-sm text-rose-200/90 font-mono leading-relaxed">
            {message.content || "Adversarial instruction was neutralized and prevented from reaching the LLM."}
          </p>

          {message.threat && (
            <div className="mt-3 pt-2.5 border-t border-rose-900/40 flex flex-wrap gap-4 text-xs font-mono text-rose-300/80">
              <span>Category: <strong className="text-rose-200">{message.threat.category}</strong></span>
              <span>Threat Score: <strong className="text-rose-200">{message.threat.score}%</strong></span>
              <span>Severity: <strong className="text-rose-200 uppercase">{message.threat.severity}</strong></span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`max-w-[90%] rounded-2xl px-4 py-3.5 ${
            isProtected
              ? "bg-[#0f172a] border border-[#1e293b] text-slate-100 shadow-sm"
              : "bg-slate-900/70 border border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Bot className={`w-3.5 h-3.5 ${isProtected ? "text-cyan-400" : "text-slate-400"}`} />
              <span>{isProtected ? "AegisTrust Protected AI" : "Unprotected AI (Naive)"}</span>
            </div>
            {message.engine && (
              <span className="text-[10px] text-slate-500 uppercase">{message.engine}</span>
            )}
          </div>

          <p className="text-sm font-sans whitespace-pre-wrap leading-relaxed text-slate-200">
            {message.content}
          </p>

          {message.pii && message.pii.tokenized && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Bidirectional Shield: {message.pii.entities.length} PII entities masked before LLM transmission.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
