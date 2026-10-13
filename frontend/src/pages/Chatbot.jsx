import React, { useState, useRef, useEffect } from "react";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  Bot,
  User,
  Send,
  ShieldCheck,
  Sparkles,
  Lock,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import FunctionGuide from "../components/ui/FunctionGuide.jsx";

export function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your **AegisTrust Blue-Team AI Defense Assistant**. Ask me anything about malware indicators, infected packages/scripts, or incident remediation.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const suggestedPrompts = [
    "How do I detect backdoors in npm / PyPI package manifests?",
    "Explain how to identify and neutralize an active reverse shell.",
    "What are best practices for securing CI/CD build scripts against malware?",
    "How can I audit a suspicious PowerShell script for obfuscated download cradles?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const historyPayload = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.chat(text, undefined, historyPayload);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          engine: res.engine,
          latencyMs: res.latencyMs,
          pii: res.pii,
        },
      ]);
      if (res.pii?.tokenized) {
        toast.success("Sensitive data masked before analysis");
      }
    } catch (err) {
      toast.error(err.message || "Failed to receive response from Blue-Team AI");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **Gateway Error:** Unable to connect to the defensive AI analyst. Please verify the gateway connection.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Session refreshed. How can I assist you with blue-team defensive operations, malware inspection, or package auditing today?",
      },
    ]);
    toast.warn("Chat history reset");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>Blue-Team AI Cyber Defense Assistant</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              DEFENSE ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated defensive conversational analyst assisting with file malware remediation, supply-chain threat triage, and zero-trust engineering.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Suggested Blue-Team Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(prompt)}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all text-left"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Single Chatbot Conversation Container */}
      <div className="flex flex-col h-[620px] rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl overflow-hidden glow-cyan">
        {/* Chat Header Status */}
        <div className="px-5 py-3 border-b border-[#1e293b] bg-slate-900/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AegisTrust Defensive Analyst (Gemini 2.5 Flash)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Trust Privacy Shield Active</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-3`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    isUser
                      ? "bg-cyan-950/50 border border-cyan-800/80 text-slate-100"
                      : "bg-slate-950/80 border border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] font-mono text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isUser ? "Security Engineer" : "Defensive AI Analyst"}
                    </span>
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {msg.latencyMs && (
                          <span className="text-slate-500">{msg.latencyMs}ms</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, idx)}
                          className="hover:text-cyan-300 transition-colors"
                          title="Copy message"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-sm font-sans whitespace-pre-wrap leading-relaxed text-slate-200">
                    {msg.content}
                  </div>

                  {msg.pii && msg.pii.tokenized && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Zero-Trust: Sensitive data tokenized before processing.</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-w-sm">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="text-xs font-mono text-slate-300">
                Blue-Team AI analyzing threat telemetry & formulating defense...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-900/90 border-t border-[#1e293b] flex items-center gap-3"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the Blue-Team AI regarding malware remediation, package auditing, or incident response..."
            className="flex-1 bg-transparent px-4 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all disabled:opacity-40 shadow-[0_0_16px_rgba(6,182,212,0.3)] shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consult AI</span>
          </button>
        </form>
      </div>

      {/* Operational Guidelines for Blue-Team Chat */}
      <FunctionGuide
        moduleName="Blue-Team AI Cyber Defense Assistant"
        badge="AUTONOMOUS SOC CHAT"
        color="#38bdf8"
        steps={[
          {
            num: "01",
            heading: "Select Preset or Enter Threat Inquiry",
            detail: "Click one of the recommended prompts (e.g., package manifest backdoors, reverse shell defense, CI/CD audits) or type your specific operational inquiry.",
            tip: "Focuses strictly on defensive engineering and remediation.",
          },
          {
            num: "02",
            heading: "Mode 1: Concise High-Priority Answers",
            detail: "By default, the assistant delivers responses in strictly up to 5 clear, high-density bullet points without conversational filler for rapid emergency triage.",
            tip: "Ideal for fast SOC incident triage and live on-call rotations.",
          },
          {
            num: "03",
            heading: "Mode 2: In-Depth Technical Expansion",
            detail: "Include keywords like 'more detail', 'in detail', or 'elaborate'. The AI switches to deep-dive mode, outputting complete shell commands, regex patterns, and security scripts.",
            tip: "Type: 'Explain in detail' for complete remediation playbooks.",
          },
          {
            num: "04",
            heading: "Zero-Trust Protected Inference",
            detail: "All prompt transmissions are pre-filtered by the AegisTrust Gateway, neutralizing prompt injections and redacting sensitive data before routing to Google Gemini.",
            tip: "100% compliant with zero-leakage enterprise governance.",
          },
        ]}
        proTips={[
          "Ask for copy-pasteable remediation scripts: e.g. 'Generate a bash script to isolate infected host 10.0.4.15'.",
          "Session memory persists throughout your active tab; click 'Reset' in the upper-right corner to clear the triage session.",
        ]}
      />
    </div>
  );
}

export default Chatbot;
