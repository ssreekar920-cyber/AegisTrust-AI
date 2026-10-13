import React, { useState } from "react";
import ChatPane from "../components/playground/ChatPane.jsx";
import AttackPresets from "../components/playground/AttackPresets.jsx";
import FileDropZone from "../components/playground/FileDropZone.jsx";
import ToolInterceptorPanel from "../components/playground/ToolInterceptorPanel.jsx";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { Send, RefreshCw, Layers } from "lucide-react";

export function Playground({ onInspectIncident }) {
  const [inputText, setInputText] = useState("");
  const [unprotectedMessages, setUnprotectedMessages] = useState([]);
  const [protectedMessages, setProtectedMessages] = useState([]);
  const [loadingUnprotected, setLoadingUnprotected] = useState(false);
  const [loadingProtected, setLoadingProtected] = useState(false);
  const [errorUnprotected, setErrorUnprotected] = useState(null);
  const [errorProtected, setErrorProtected] = useState(null);
  const toast = useToast();

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage = { role: "user", content: text };

    // Append user message to both panes
    setUnprotectedMessages((prev) => [...prev, userMessage]);
    setProtectedMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // 1. Send to Unprotected Pane
    setLoadingUnprotected(true);
    setErrorUnprotected(null);
    api.chatUnprotected(text)
      .then((res) => {
        setUnprotectedMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.reply,
            engine: res.engine,
            latencyMs: res.latencyMs,
          },
        ]);
      })
      .catch((err) => {
        setErrorUnprotected(err.message);
      })
      .finally(() => {
        setLoadingUnprotected(false);
      });

    // 2. Send to Protected Pane (AegisTrust Zero-Trust Pipeline)
    setLoadingProtected(true);
    setErrorProtected(null);
    api.chatProtected(text)
      .then((res) => {
        setProtectedMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.reply,
            action: res.action,
            blocked: res.blocked,
            badges: res.badges,
            threat: res.threat,
            evidence: res.evidence,
            pii: res.pii,
            incidentId: res.incidentId,
            engine: res.engine,
            latencyMs: res.latencyMs,
          },
        ]);

        if (res.blocked) {
          toast.error("Threat blocked and logged");
        } else if (res.pii?.tokenized) {
          toast.success("PII masked before sending");
        } else {
          toast.success("Response verified safe");
        }
      })
      .catch((err) => {
        setErrorProtected(err.message);
      })
      .finally(() => {
        setLoadingProtected(false);
      });
  };

  const handlePresetSelect = (payload) => {
    setInputText(payload);
  };

  const handleClearChat = () => {
    setUnprotectedMessages([]);
    setProtectedMessages([]);
    setInputText("");
    toast.warn("Chat history reset");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>Dual-Pane Security Playground</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              LIVE COMPARISON
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time side-by-side comparison of Unprotected AI vs. AegisTrust AI Zero-Trust Gateway.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* 4 Attack Presets */}
      <AttackPresets onSelectPreset={handlePresetSelect} currentText={inputText} />

      {/* Document & Screenshot Inspection Area */}
      <FileDropZone onInsertText={(content) => handleSend(content)} />

      {/* Side-by-Side Dual Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Pane: Unprotected AI */}
        <ChatPane
          title="Unprotected Standard AI"
          subtitle="Naive system prompt • No input sanitization • Raw data exposed"
          isProtected={false}
          messages={unprotectedMessages}
          loading={loadingUnprotected}
          error={errorUnprotected}
          onRetry={() => handleSend(unprotectedMessages[unprotectedMessages.length - 1]?.content)}
        />

        {/* Right Pane: AegisTrust Protected AI */}
        <ChatPane
          title="AegisTrust Protected AI"
          subtitle="Zero-Trust Pipeline • Inbound Quarantine • Bidirectional Shield"
          isProtected={true}
          messages={protectedMessages}
          loading={loadingProtected}
          error={errorProtected}
          onRetry={() => handleSend(protectedMessages[protectedMessages.length - 1]?.content)}
          onInspectIncident={onInspectIncident}
        />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl flex items-center gap-3"
      >
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Send a prompt to test both AI engines simultaneously (Enter to send, Shift+Enter for newline)..."
          className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || loadingProtected || loadingUnprotected}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all disabled:opacity-40 shadow-[0_0_16px_rgba(6,182,212,0.3)] shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Evaluate Both</span>
        </button>
      </form>

      {/* Pillar 3: Tool Interceptor Panel */}
      <ToolInterceptorPanel onInspectIncident={onInspectIncident} />
    </div>
  );
}

export default Playground;
