import React, { useState } from "react";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  Lock,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Key,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Hash,
  Scale,
  Sparkles,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import FunctionGuide from "../components/ui/FunctionGuide.jsx";

export function PrivacyVault() {
  const [activeTab, setActiveTab] = useState("privacy"); // 'privacy' | 'fraud' | 'ledger'
  const toast = useToast();

  // Privacy State
  const [privacyInput, setPrivacyInput] = useState(
    "Please update billing profile for John Doe (SSN: 987-65-4321, Phone: 415-555-2671). Charge credit card 4111 2222 3333 4444 (CVV: 892) and send notification to john.doe@enterprise-corp.io. Backup AWS Key: AKIAIOSFODNN7EXAMPLE."
  );
  const [privacyResult, setPrivacyResult] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // Fraud State
  const [fraudInput, setFraudInput] = useState(
    "URGENT REQUEST FROM CEO: Please execute an immediate confidential wire transfer of $84,500 to our new vendor partner due to internal audit. Updated routing number: 021000021, Beneficiary: Apex Global Holdings. Keep this strictly confidential until completion."
  );
  const [fraudSender, setFraudSender] = useState("ceo-urgent-notice@executive-corp.xyz");
  const [fraudResult, setFraudResult] = useState(null);
  const [fraudLoading, setFraudLoading] = useState(false);

  // Ledger State
  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const handleInspectPrivacy = async (textToInspect) => {
    const text = textToInspect || privacyInput;
    if (!text.trim()) {
      toast.error("Please enter text or customer records to inspect");
      return;
    }
    setPrivacyLoading(true);
    try {
      const res = await api.inspectPrivacyVault(text);
      setPrivacyResult(res);
      toast.success("Zero-Knowledge privacy transformation completed");
    } catch (err) {
      toast.error(err.message || "Privacy inspection failed");
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleAnalyzeFraud = async (textToAnalyze, senderToUse) => {
    const text = textToAnalyze || fraudInput;
    const sender = senderToUse || fraudSender;
    if (!text.trim()) {
      toast.error("Please enter email text or transaction instructions");
      return;
    }
    setFraudLoading(true);
    try {
      const res = await api.analyzeFraud(text, "email", sender);
      setFraudResult(res);
      if (res.isFraudulent) {
        toast.error(`Financial Fraud Intercepted! Risk Score: ${res.fraudRiskScore}%`);
      } else {
        toast.success("Communication verified benign.");
      }
    } catch (err) {
      toast.error(err.message || "Fraud analysis failed");
    } finally {
      setFraudLoading(false);
    }
  };

  const handleLoadLedger = async () => {
    setLedgerLoading(true);
    try {
      const res = await api.getVerifiableAuditLedger();
      setLedger(res);
    } catch (err) {
      toast.error(err.message || "Failed to load audit ledger");
    } finally {
      setLedgerLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Security, Privacy & Trust Solution
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-950 text-violet-300 border border-violet-800">
              ZERO-RETENTION DLP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Safeguarding sensitive data, detecting financial fraud, ensuring differential privacy, and building verifiable trust in AI-driven workflows.
          </p>
        </div>

        {/* 3 Pillar Tabs */}
        <div className="flex items-center gap-1 bg-[#0f172a] p-1 rounded-xl border border-[#1e293b] text-xs font-mono">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "privacy"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🔒 Privacy Vault & DLP
          </button>
          <button
            onClick={() => setActiveTab("fraud")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "fraud"
                ? "bg-rose-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ Fraud & BEC Defense
          </button>
          <button
            onClick={() => {
              setActiveTab("ledger");
              handleLoadLedger();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "ledger"
                ? "bg-violet-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📜 Verifiable Trust Ledger
          </button>
        </div>
      </div>

      {/* TAB 1: PRIVACY VAULT & DLP */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          {/* Quick Info Banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-900/40 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong>Zero-Knowledge Reversible Tokenization</strong>
                <p className="text-slate-400 text-[11px]">
                  Personally Identifiable Information (SSNs, cards, credentials) is intercepted and replaced with synthetic cryptographic tokens before LLM execution, then safely restored on egress.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
              GDPR / HIPAA COMPLIANT
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Text / Presets */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-cyan-400" />
                  Raw Ingress Payload with Sensitive Data
                </h3>
                <span className="text-[10px] font-mono text-slate-500">RAW DATA</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const text = "Customer John Doe (SSN: 987-65-4321, Card: 4111 2222 3333 4444, Secret: sk-live-99x817294). Transfer funds to john@corp.io.";
                    setPrivacyInput(text);
                    handleInspectPrivacy(text);
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
                >
                  Customer Financial Record
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = "Employee Alex (Phone: 212-555-0199, Email: alex@health.org, Medical ID: MED-8841-A). AWS Credentials: AKIAIOSFODNN7EXAMPLE.";
                    setPrivacyInput(text);
                    handleInspectPrivacy(text);
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
                >
                  Healthcare / AWS Key Record
                </button>
              </div>

              <textarea
                rows={7}
                value={privacyInput}
                onChange={(e) => setPrivacyInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                placeholder="Paste customer message containing SSN, credit cards, emails, or credentials..."
              />

              <button
                type="button"
                onClick={() => handleInspectPrivacy()}
                disabled={privacyLoading}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(6,182,212,0.3)]"
              >
                {privacyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Differential Privacy Tokenization...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Run Zero-Knowledge Privacy Transformation</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Sanitized DLP Output & Cryptographic Proof */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Safeguarded AI Ingress (De-Identified)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {privacyResult?.complianceStatus || "AWAITING TRANSFORM"}
                </span>
              </div>

              {privacyResult ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                    {privacyResult.maskedText}
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-850 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">PII ENTITIES REDACTED</span>
                      <span className="font-bold text-cyan-400">
                        {privacyResult.totalEntities} identifiers
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">PRIVACY RISK LEVEL</span>
                      <span
                        className={`font-bold ${
                          privacyResult.privacyRiskLevel === "CRITICAL"
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {privacyResult.privacyRiskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Entities list */}
                  {privacyResult.entitiesFound.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Decoupled Confidential Tokens:
                      </span>
                      {privacyResult.entitiesFound.map((e, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono"
                        >
                          <span className="text-slate-400 uppercase font-bold">{e.type}</span>
                          <span className="text-cyan-300 font-semibold">{e.token}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-violet-950/20 border border-violet-900/40 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                    <span>Cryptographic Proof:</span>
                    <span className="text-violet-300 font-bold">{privacyResult.cryptographicProof}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs font-mono">
                  Click "Run Zero-Knowledge Privacy Transformation" on the left to see live PII de-identification.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FRAUD & BEC DEFENSE */}
      {activeTab === "fraud" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-900/40 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <strong>Autonomous Financial Fraud & BEC Interceptor</strong>
                <p className="text-slate-400 text-[11px]">
                  Scans invoices, bank routing instructions, and emails for executive impersonation, wire transfer redirects, and psychological urgency attacks.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold">
              FRAUD PREVENTION ENGINE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Email / Transaction */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-rose-400" />
                Analyze Communication for Financial Fraud
              </h3>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const text = "URGENT WIRE TRANSFER: CEO requires immediate wire of $94,000 for vendor buyout. Updated routing number: 021000021, Beneficiary: Apex Global. Keep strictly confidential.";
                    const sender = "ceo-direct-desk@urgent-executive.xyz";
                    setFraudInput(text);
                    setFraudSender(sender);
                    handleAnalyzeFraud(text, sender);
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-800 transition-colors"
                >
                  CEO Impersonation Wire Fraud
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = "Supplier update: Due to internal bank restructuring, please remit all future invoice payments to our revised account. Routing: 121000358, IBAN: US641210003589999.";
                    const sender = "billing-notification@vendor-support.click";
                    setFraudInput(text);
                    setFraudSender(sender);
                    handleAnalyzeFraud(text, sender);
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-800 transition-colors"
                >
                  Vendor Invoice Redirection
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Sender Address</label>
                <input
                  type="text"
                  value={fraudSender}
                  onChange={(e) => setFraudSender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Message / Payment Instructions</label>
                <textarea
                  rows={6}
                  value={fraudInput}
                  onChange={(e) => setFraudInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                  placeholder="Paste invoice or email text..."
                />
              </div>

              <button
                type="button"
                onClick={() => handleAnalyzeFraud()}
                disabled={fraudLoading}
                className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(244,63,94,0.3)]"
              >
                {fraudLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Screening against Fraud Signatures...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Run Financial Fraud Detection</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Fraud Findings & Explanation */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-400" />
                  Fraud Verdict & Transparent Rationale
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    fraudResult?.isFraudulent
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  }`}
                >
                  {fraudResult?.verdict || "AWAITING SCREENING"}
                </span>
              </div>

              {fraudResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-850 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">FRAUD RISK SCORE</span>
                      <span
                        className={`text-lg font-bold ${
                          fraudResult.fraudRiskScore >= 70 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {fraudResult.fraudRiskScore}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">THREAT PATTERNS</span>
                      <span className="font-bold text-slate-200">
                        {fraudResult.findings.length} detected
                      </span>
                    </div>
                  </div>

                  {fraudResult.findings.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Matched Indicators:
                      </span>
                      {fraudResult.findings.map((f, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-[10px] font-mono space-y-1"
                        >
                          <div className="flex items-center justify-between text-rose-300 font-bold">
                            <span>
                              [{f.id}] {f.name}
                            </span>
                            <span className="uppercase text-[9px]">{f.severity}</span>
                          </div>
                          <div className="text-slate-400">{f.description}</div>
                          <div className="text-amber-300 truncate font-semibold">
                            Evidence: "{f.matchedEvidence}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                    <strong className="text-cyan-400 block">🛡️ Actionable Mitigation Plan:</strong>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-[11px]">
                      {fraudResult.remediation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs font-mono">
                  Select a scenario and click "Run Financial Fraud Detection" to inspect payment tampering.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIABLE TRUST & TRANSPARENCY LEDGER */}
      {activeTab === "ledger" && (
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Hash className="w-4 h-4 text-violet-400" />
                Cryptographically Verifiable Trust & Transparency Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Every AI intervention, PII anonymization, and threat quarantine is cryptographically chained using SHA-256 blocks for immutable auditability.
              </p>
            </div>

            <button
              onClick={handleLoadLedger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${ledgerLoading ? "animate-spin" : ""}`} />
              Verify Chain
            </button>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {ledger.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                Click "Verify Chain" to inspect cryptographic blocks.
              </div>
            ) : (
              ledger.map((block) => (
                <div
                  key={block.index}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 hover:border-violet-800 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-bold">
                        BLOCK #{block.index}
                      </span>
                      <strong className="text-cyan-400">{block.action}</strong>
                    </div>
                    <span className="text-slate-500">{block.timestamp}</span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {block.details}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] text-slate-500 pt-2 border-t border-slate-900">
                    <div className="truncate">
                      <span>PREV HASH: </span>
                      <span className="text-slate-400">{block.prevHash}</span>
                    </div>
                    <div className="truncate text-right">
                      <span>BLOCK HASH: </span>
                      <span className="text-violet-300 font-bold">{block.hash}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Operational Guidelines for Privacy Vault & Fraud Defense */}
      <FunctionGuide
        moduleName="Privacy Vault & Financial Fraud Defense"
        badge="ZERO-KNOWLEDGE PRIVACY & BEC INTERCEPTOR"
        color="#10b981"
        steps={[
          {
            num: "01",
            heading: "Input Sensitive Text or Load Sample",
            detail: "Paste raw text containing SSNs, Credit Cards, API Keys, phone numbers, or select the pre-filled Enterprise Support preset.",
            tip: "Bi-directional Regex + NER entity recognition.",
          },
          {
            num: "02",
            heading: "Execute Zero-Knowledge Tokenization",
            detail: "Click 'Inspect & Tokenize'. The DLP engine replaces sensitive values with synthetic tokens (e.g. [[PII_SSN_1]]) before sending anything to an LLM.",
            tip: "Zero plaintext data leaves your local memory.",
          },
          {
            num: "03",
            heading: "Screen Financial Emails for BEC & Wire Fraud",
            detail: "Switch to the 'Financial Fraud & BEC' tab to paste inbound emails. The engine evaluates linguistic coercion, VIP impersonation, and altered bank IBANs.",
            tip: "Scores urgency, domain spoofing, and wire redirects.",
          },
          {
            num: "04",
            heading: "Verify Cryptographic Chain of Custody",
            detail: "Switch to 'Verifiable Audit Ledger' and click 'Verify Chain' to inspect deterministic SHA-256 blocks ensuring immutable auditability for GDPR & HIPAA.",
            tip: "Chained BlockHash = SHA256(prevHash + action + timestamp).",
          },
        ]}
        proTips={[
          "Synthetic tokenization guarantees 0.00% PII leakage to third-party AI models while preserving full semantic context.",
          "When reviewing fraud alerts with score >85%, always execute out-of-band phone verification before authorizing wire disbursements.",
        ]}
      />
    </div>
  );
}

export default PrivacyVault;
