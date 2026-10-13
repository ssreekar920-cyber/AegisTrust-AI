import React from "react";
import MessageBubble from "./MessageBubble.jsx";
import { Shield, ShieldAlert, Bot, Sparkles, RotateCcw } from "lucide-react";
import Spinner from "../ui/Spinner.jsx";

export function ChatPane({
  title,
  subtitle,
  isProtected = false,
  messages = [],
  loading = false,
  error = null,
  onRetry,
  onInspectIncident,
}) {
  return (
    <div
      className={`flex flex-col h-[600px] rounded-2xl bg-[#0f172a] border transition-all shadow-xl overflow-hidden ${
        isProtected
          ? "border-cyan-500/30 glow-cyan"
          : "border-slate-800"
      }`}
    >
      {/* Pane Header */}
      <div
        className={`px-5 py-3.5 border-b flex items-center justify-between ${
          isProtected
            ? "bg-slate-900/90 border-cyan-900/40"
            : "bg-slate-900/40 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg border ${
              isProtected
                ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {isProtected ? (
              <Shield className="w-4 h-4 text-cyan-400" />
            ) : (
              <Bot className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div>
            <h3
              className={`text-sm font-bold flex items-center gap-2 ${
                isProtected ? "text-slate-100" : "text-slate-300"
              }`}
            >
              {title}
              {isProtected && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SHIELD ACTIVE
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        {isProtected && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Trust Gateway</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-3">
              {isProtected ? (
                <Shield className="w-8 h-8 text-cyan-500/40" />
              ) : (
                <Bot className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-400">No conversation yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Send a message or pick an attack preset to compare both panes.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg}
              isProtected={isProtected}
              onInspectIncident={onInspectIncident}
            />
          ))
        )}

        {/* Loading Spinner Bubble */}
        {loading && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 max-w-xs">
            <Spinner size="sm" />
            <span className="text-xs font-mono text-slate-400">
              {isProtected ? "Evaluating through AegisTrust Zero-Trust Pipeline..." : "Querying unprotected model..."}
            </span>
          </div>
        )}

        {/* Error Bubble */}
        {error && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Gateway error — try again</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/50 hover:bg-rose-900 text-rose-200 text-xs transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPane;
