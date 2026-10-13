import React, { useState } from "react";
import ScannerForm from "../components/scanner/ScannerForm.jsx";
import VectorProgress from "../components/scanner/VectorProgress.jsx";
import AuditScorecard from "../components/scanner/AuditScorecard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { PROMPT_TEMPLATES } from "../data/prompts.js";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export function Scanner({ onOpenDashboard }) {
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_TEMPLATES.customer_support.prompt);
  const [templateId, setTemplateId] = useState("customer_support");
  const [mode, setMode] = useState("full");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [progressState, setProgressState] = useState({ completed: 0, total: 12 });
  const toast = useToast();

  const handleRunAudit = async () => {
    if (!systemPrompt.trim()) return;

    setLoading(true);
    setReport(null);
    const totalVecs = mode === "quick" ? 4 : 12;
    setProgressState({ completed: 1, total: totalVecs });

    try {
      const res = await api.runAudit({
        systemPrompt,
        templateId,
        mode,
      });

      setReport(res);
      toast.success("Security audit completed — Report ready");
    } catch (err) {
      toast.error(err.message || "Audit execution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>Automated Red-Teaming Scanner</span>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            AUDIT SCORECARD
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Stress-test system prompts against 12 automated adversarial vectors across Jailbreak Resistance, Data Leaks, and Roleplay Rigidity.
        </p>
      </div>

      {/* Target Prompt Configuration Form */}
      <ScannerForm
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        templateId={templateId}
        setTemplateId={setTemplateId}
        mode={mode}
        setMode={setMode}
        onRunAudit={handleRunAudit}
        loading={loading}
      />

      {/* Live Simulation Progress */}
      {loading && (
        <VectorProgress
          totalVectors={progressState.total}
          completedCount={progressState.completed}
          currentVectorName="Executing adversarial payloads and LLM judge evaluations..."
        />
      )}

      {/* Audit Scorecard Results */}
      {report && !loading && (
        <AuditScorecard
          report={report}
          onRunAgain={handleRunAudit}
          onOpenDashboard={onOpenDashboard}
        />
      )}

      {/* Empty State before first run */}
      {!report && !loading && (
        <EmptyState
          title="No Audit Report Yet"
          description="Paste your system prompt and run the audit to get your security grade."
          icon={ShieldCheck}
        />
      )}
    </div>
  );
}

export default Scanner;
