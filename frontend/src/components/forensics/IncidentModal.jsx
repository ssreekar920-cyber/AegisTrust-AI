import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal.jsx";
import SeverityChip from "../dashboard/SeverityChip.jsx";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Copy,
  Hash,
  ShieldCheck,
  FileCode,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function IncidentModal({ isOpen, onClose, incidentId, threatId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patchLoading, setPatchLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [patchData, setPatchData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function loadIncident() {
      if (!isOpen || (!incidentId && !threatId)) return;
      setLoading(true);
      setPatchData(null);
      try {
        if (threatId) {
          const res = await api.getThreatById(threatId);
          setData(res);
          if (res.incident?.patch?.systemPrompt) {
            setPatchData({
              systemPrompt: res.incident.patch.systemPrompt,
              rationale: res.incident.patch.rationale,
            });
          }
        } else if (incidentId) {
          // If given incident ID directly
          const threats = await api.getThreats({ limit: 50 });
          const match = threats.items.find((t) => t.incidentId === incidentId || t.id === incidentId);
          if (match) {
            const res = await api.getThreatById(match.id);
            setData(res);
          }
        }
      } catch (err) {
        toast.error("Failed to load incident details");
      } finally {
        setLoading(false);
      }
    }
    loadIncident();
  }, [isOpen, incidentId, threatId, toast]);

  const handleGeneratePatch = async () => {
    const targetIncidentId = data?.incident?.id || data?.threat?.incidentId || incidentId;
    if (!targetIncidentId) {
      toast.warn("No linked incident record available for auto-patching");
      return;
    }

    setPatchLoading(true);
    try {
      const res = await api.generatePatch(targetIncidentId);
      setPatchData(res.patch);
      toast.success("AI Auto-Patch generated successfully");
    } catch (err) {
      toast.error(err.message || "Auto-patch generation failed");
    } finally {
      setPatchLoading(false);
    }
  };

  const handleApplyPatch = async () => {
    const targetIncidentId = data?.incident?.id || data?.threat?.incidentId || incidentId;
    if (!targetIncidentId) return;

    setApplyLoading(true);
    try {
      const res = await api.applyPatch(targetIncidentId);
      toast.success(`Patch applied to gateway — ${res.gateway.version}`);
      if (data?.incident) {
        data.incident.status = "patched";
      }
    } catch (err) {
      toast.error(err.message || "Failed to apply patch");
    } finally {
      setApplyLoading(false);
    }
  };

  const copyToClipboard = (text, message = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const threat = data?.threat || {};
  const incident = data?.incident || {};
  const shortId = (incident.id || threat.id || "000000").slice(-6);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>Forensic Audit & AI Auto-Patch Modal</span>
          <span className="text-xs font-mono text-slate-400">#INC-{shortId}</span>
        </span>
      }
      maxWidth="max-w-4xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono text-sm">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading Incident Forensics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Header Information */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <SeverityChip severity={threat.severity || "high"} />
              <span className="font-mono text-sm font-bold text-slate-200">
                {threat.attackType || incident.threatVector || "Threat Incident"}
              </span>
              {threat.owaspId && (
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {threat.owaspId}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Status: <strong className="text-emerald-400 uppercase">{incident.status || "open"}</strong></span>
              <span>•</span>
              <span>{new Date(threat.ts || incident.createdAt || Date.now()).toLocaleString()}</span>
            </div>
          </div>

          {/* 2. Threat Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase">Channel</span>
              <span className="text-xs font-semibold text-slate-200">{threat.channel || incident.source || "chat"}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase">Confidence Score</span>
              <span className="text-xs font-semibold text-rose-400">{threat.score || incident.confidence || 95}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase">Action Taken</span>
              <span className="text-xs font-semibold text-amber-400 uppercase">{threat.action || "quarantined"}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase">Matched Rules</span>
              <span className="text-xs font-semibold text-cyan-400">
                {(threat.matchedRules || ["INJ-001"]).join(", ")}
              </span>
            </div>
          </div>

          {/* 3. Redacted Payload Viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-400">
                Redacted Adversarial Payload:
              </span>
              {threat.payloadHash && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(threat.payloadHash, "SHA-256 payload hash copied")}
                  className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  <Hash className="w-3 h-3" />
                  <span>Copy Hash ({threat.payloadHash.slice(0, 10)}…)</span>
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300/90 whitespace-pre-wrap leading-relaxed select-all">
              {threat.payloadRedacted || incident.payloadRedacted || "No payload snippet stored."}
            </div>
          </div>

          {/* 4. AI Auto-Patch Panel */}
          <div className="p-5 rounded-xl bg-slate-950 border border-cyan-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Pillar 4: Self-Healing AI Auto-Patch Engine
                </h4>
              </div>

              <button
                type="button"
                disabled={patchLoading}
                onClick={handleGeneratePatch}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                {patchLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>⚡ Generate AI Auto-Patch</span>
              </button>
            </div>

            {patchLoading && (
              <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-800 text-center font-mono text-xs text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                <span>Diagnosing vulnerability and synthesizing hardened system prompt...</span>
              </div>
            )}

            {patchData && !patchLoading && (
              <div className="space-y-4">
                {patchData.diagnosis && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-mono text-cyan-400 font-bold block mb-1">
                      Diagnosis:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{patchData.diagnosis}</p>
                  </div>
                )}

                {/* Diff-style guardrail lines */}
                {patchData.rationale && patchData.rationale.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 font-mono text-xs">
                    <span className="text-emerald-400 font-bold block mb-2">
                      Hardened Guardrail Lines Added:
                    </span>
                    <ul className="space-y-1.5 text-emerald-300">
                      {patchData.rationale.map((line, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 select-none">+</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Patched System Prompt Code Block */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Patched System Prompt Preview:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(patchData.systemPrompt, "Patch copied to clipboard")}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Patch</span>
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
                    {patchData.systemPrompt}
                  </pre>
                </div>

                {/* Actions: Apply to Gateway */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(patchData.systemPrompt, "Patch copied")}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition-colors"
                  >
                    Copy Patch
                  </button>
                  <button
                    type="button"
                    disabled={applyLoading || incident.status === "patched"}
                    onClick={handleApplyPatch}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  >
                    {applyLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>{incident.status === "patched" ? "Patch Applied ✓" : "Apply to Gateway"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default IncidentModal;
