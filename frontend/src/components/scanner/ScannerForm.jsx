import React from "react";
import { PROMPT_TEMPLATES, DEFAULT_HARDENED_SYSTEM_PROMPT } from "../../data/prompts.js";
import { Rocket, ShieldCheck, RefreshCw, FileText } from "lucide-react";

export function ScannerForm({
  systemPrompt,
  setSystemPrompt,
  templateId,
  setTemplateId,
  mode,
  setMode,
  onRunAudit,
  loading,
}) {
  const handleTemplateChange = (e) => {
    const val = e.target.value;
    setTemplateId(val);
    if (val === "hardened_gateway") {
      setSystemPrompt(DEFAULT_HARDENED_SYSTEM_PROMPT);
    } else if (PROMPT_TEMPLATES[val]) {
      setSystemPrompt(PROMPT_TEMPLATES[val].prompt);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#1e293b]">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Target AI System Prompt Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure or select an AI prompt to execute automated red-teaming simulations against.
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-mono text-slate-400 shrink-0">Template:</label>
          <select
            value={templateId || "customer_support"}
            onChange={handleTemplateChange}
            className="w-full sm:w-60 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="customer_support">Customer Support Bot (Vulnerable)</option>
            <option value="hr_screener">HR Resume Screener</option>
            <option value="code_assistant">Code Assistant</option>
            <option value="banking_agent">Banking Agent</option>
            <option value="hardened_gateway">AegisTrust Hardened Gateway Prompt</option>
          </select>
        </div>
      </div>

      {/* Textarea */}
      <div className="mb-5">
        <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
          Target System Prompt:
        </label>
        <textarea
          rows={5}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Paste system instructions to be stress-tested..."
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-y"
        />
      </div>

      {/* Controls: Mode & Run Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400">Scan Mode:</span>
          <div className="flex p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMode("full")}
              className={`px-3 py-1 rounded-md transition-all ${
                mode === "full"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Full Audit (12 vectors)
            </button>
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`px-3 py-1 rounded-md transition-all ${
                mode === "quick"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Quick Scan (4 vectors)
            </button>
          </div>
        </div>

        {/* Submit Run Button */}
        <button
          type="button"
          disabled={loading || !systemPrompt.trim()}
          onClick={onRunAudit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all disabled:opacity-50 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
          <span>🚀 Run Automated Security Audit</span>
        </button>
      </div>
    </div>
  );
}

export default ScannerForm;
