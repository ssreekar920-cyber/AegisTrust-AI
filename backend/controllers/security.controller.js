import detectorService from "../services/detector.service.js";
import piiService from "../services/pii.service.js";
import documentService from "../services/document.service.js";
import agentService from "../services/agent.service.js";
import geminiService from "../services/gemini.service.js";
import patcherService from "../services/patcher.service.js";
import scannerService from "../services/scanner.service.js";
import telemetryService from "../services/telemetry.service.js";
import malwareService from "../services/malware.service.js";
import integrationsService from "../services/integrations.service.js";
import trustService from "../services/trust.service.js";
import fraudService from "../services/fraud.service.js";
import GatewayConfig from "../models/gatewayConfig.model.js";
import ThreatLog from "../models/threatLog.model.js";
import Incident from "../models/incident.model.js";
import AuditReport from "../models/auditReport.model.js";
import env from "../config/env.js";
import { redactPayload, computePayloadHash } from "../utils/redact.js";
import logger from "../utils/logger.js";
import { PROMPT_TEMPLATES } from "../data/prompts.js";

/**
 * Health endpoint returning latency and gateway zero-trust status
 */
export async function getHealth(req, res) {
  const start = Date.now();
  let gatewayVersion = "v1";
  try {
    const config = await GatewayConfig.findById("singleton");
    if (config) gatewayVersion = config.version;
  } catch {
    // Keep default
  }

  const latencyMs = Date.now() - start;
  res.status(200).json({
    ok: true,
    gateway: "active",
    zeroTrust: true,
    model: env.GEMINI_MODEL,
    version: gatewayVersion,
    latencyMs,
    uptimeSec: Math.floor(process.uptime()),
  });
}

/**
 * Unprotected chat endpoint for side-by-side comparison pane.
 * Strictly gated by DEMO_MODE.
 */
export async function chatUnprotected(req, res, next) {
  const startTime = Date.now();
  try {
    if (!env.DEMO_MODE) {
      return res.status(403).json({
        error: {
          code: "DEMO_MODE_DISABLED",
          message: "Unprotected pane is disabled in production environments.",
        },
      });
    }

    const { message } = req.body;

    const result = await geminiService.chat({
      systemPrompt: env.DEMO_SYSTEM_PROMPT_NAIVE,
      messages: [{ role: "user", content: message }],
      model: env.GEMINI_MODEL,
    });

    const latencyMs = Date.now() - startTime;

    return res.status(200).json({
      reply: result.text,
      pane: "unprotected",
      engine: result.engine,
      latencyMs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Protected chat endpoint running full 8-stage zero-trust pipeline.
 */
export async function chatProtected(req, res, next) {
  const startTime = Date.now();
  try {
    const { message, sessionId = "default-session" } = req.body;
    const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const userId = req.user?.id || null;

    // Stage 0: Normalize & Inspect
    const normalized = detectorService.normalizeText(message);

    // Stage 1: Classify
    const classification = detectorService.classifyText(normalized.normalized);

    const badges = [];
    const payloadHash = computePayloadHash(normalized.normalized);
    const redactedSnippet = redactPayload(message, 500);

    // Stage 2: Inbound Decision
    if (classification.action === "blocked") {
      // Create Incident for Forensics & Auto-Patch
      const incident = await Incident.create({
        source: "chat",
        payloadRedacted: redactedSnippet,
        threatVector: classification.category,
        confidence: classification.score,
        status: "open",
      });

      // Log Quarantine in ThreatLog
      await ThreatLog.create({
        userId,
        sessionId,
        clientIp,
        channel: "chat",
        direction: "inbound",
        attackType: classification.category,
        owaspId: classification.owaspId,
        severity: classification.severity,
        score: classification.score,
        action: "blocked",
        payloadRedacted: redactedSnippet,
        payloadHash,
        piiEntities: [],
        matchedRules: classification.matchedRules,
        llmCalled: false,
        incidentId: incident._id,
        latencyMs: Date.now() - startTime,
        source: "live",
      });

      badges.push({
        type: "blocked",
        label: `[BLOCKED: OWASP ${classification.owaspId || "LLM01"} - ${classification.category === "prompt_injection" ? "Prompt Injection" : "System Prompt Leakage"}]`,
        owaspId: classification.owaspId || "LLM01",
      });
      badges.push({
        type: "threat_score",
        label: `[Threat Score: ${classification.score}%]`,
      });

      const latencyMs = Date.now() - startTime;

      return res.status(200).json({
        reply: "Request quarantined by AegisTrust: Potential prompt injection or system compromise instruction intercepted before model execution.",
        action: "blocked",
        blocked: true,
        badges,
        threat: {
          score: classification.score,
          severity: classification.severity,
          category: classification.category,
        },
        evidence: classification.evidence,
        pii: {
          entities: [],
          tokenized: false,
          restored: 0,
        },
        incidentId: incident._id.toString(),
        llmCalled: false,
        engine: "shield",
        latencyMs,
      });
    }

    // Text to send to LLM (if sanitized, use stripped version)
    let textForProcessing = classification.action === "sanitized"
      ? classification.sanitizedText
      : message;

    if (classification.action === "sanitized") {
      badges.push({
        type: "sanitized",
        label: "[SANITIZED: hidden content removed]",
      });
    }

    // Stage 3: Mask PII Bidirectionally
    const piiMaskResult = piiService.maskPii(textForProcessing, sessionId);
    const maskedPrompt = piiMaskResult.maskedText;

    if (piiMaskResult.tokenized) {
      const typeLabels = piiMaskResult.entities.map((e) => e.type).join(", ");
      badges.push({
        type: "pii_masked",
        label: `[PII Masked: ${typeLabels}]`,
      });
    }

    // Stage 4: Gemini Call with hardened system prompt
    const gatewayConfig = await GatewayConfig.getSingleton();
    const chatResult = await geminiService.chat({
      systemPrompt: gatewayConfig.systemPrompt,
      messages: [{ role: "user", content: maskedPrompt }],
      model: env.GEMINI_MODEL,
    });

    // Stage 5: Output Scan for unexpected sensitive disclosures
    const outboundScan = piiService.scanOutbound(chatResult.text);

    // Stage 6: Restore PII only from session map (high-risk secrets remain masked)
    const restoreResult = piiService.restorePii(outboundScan.text, sessionId);

    if (piiMaskResult.tokenized) {
      badges.push({
        type: "restored",
        label: "[Tokenized → Restored ✓]",
      });
    }

    if (classification.score > 0) {
      badges.push({
        type: "threat_score",
        label: `[Threat Score: ${classification.score}%]`,
      });
    }

    const latencyMs = Date.now() - startTime;

    // Stage 7: Log ThreatLog
    const logAction = classification.action === "sanitized"
      ? "sanitized"
      : piiMaskResult.tokenized
      ? "masked"
      : "allow";

    await ThreatLog.create({
      userId,
      sessionId,
      clientIp,
      channel: "chat",
      direction: "inbound",
      attackType: classification.category,
      owaspId: classification.owaspId,
      severity: classification.severity,
      score: classification.score,
      action: logAction,
      payloadRedacted: redactedSnippet,
      payloadHash,
      piiEntities: piiMaskResult.entities.map((e) => ({ type: e.type, count: e.count })),
      matchedRules: classification.matchedRules,
      llmCalled: true,
      latencyMs,
      source: "live",
    });

    // Stage 8: Respond
    return res.status(200).json({
      reply: restoreResult.restoredText,
      action: logAction,
      blocked: false,
      badges,
      threat: {
        score: classification.score,
        severity: classification.severity,
        category: classification.category,
      },
      evidence: classification.evidence,
      pii: {
        entities: piiMaskResult.entities.map((e) => ({
          type: e.type,
          count: e.count,
          sample: e.sample,
        })),
        tokenized: piiMaskResult.tokenized,
        restored: restoreResult.restoredCount,
      },
      llmCalled: true,
      engine: chatResult.engine,
      latencyMs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Scan uploaded document or text for indirect prompt injection and hidden markers.
 */
export async function scanFile(req, res, next) {
  try {
    const { filename, mimeType, content } = req.body;
    const scanResult = documentService.scanDocument({ filename, mimeType, content });

    // If not clean, record a ThreatLog for telemetry
    if (!scanResult.clean) {
      const topFinding = scanResult.findings[0] || {};
      ThreatLog.create({
        channel: "file",
        direction: "inbound",
        attackType: "prompt_injection",
        owaspId: "LLM01",
        severity: topFinding.severity || "high",
        score: topFinding.severity === "critical" ? 95 : 75,
        action: "sanitized",
        payloadRedacted: redactPayload(scanResult.normalizedPreview, 300),
        payloadHash: computePayloadHash(content),
        matchedRules: topFinding.matchedRule ? [topFinding.matchedRule] : ["INJ-008"],
        llmCalled: false,
        source: "live",
      }).catch((e) => logger.warn("threat_log_file_error", { error: e.message }));
    }

    return res.status(200).json(scanResult);
  } catch (err) {
    next(err);
  }
}

/**
 * Agentic tool interceptor endpoint
 */
export async function executeAgentTool(req, res, next) {
  try {
    const { tool, args, sessionId = "default-session" } = req.body;
    const evaluation = agentService.evaluateToolCall({ tool, args, sessionId });

    let incidentId = null;

    if (evaluation.createIncident) {
      const incident = await Incident.create({
        source: "tool",
        payloadRedacted: redactPayload(JSON.stringify(args || {}), 300),
        threatVector: "excessive_agency",
        confidence: 90,
        status: "open",
      });
      incidentId = incident._id.toString();

      await ThreatLog.create({
        channel: "tool",
        direction: "inbound",
        attackType: "excessive_agency",
        owaspId: "LLM06",
        severity: evaluation.riskTier === "critical" ? "critical" : "high",
        score: evaluation.riskTier === "critical" ? 95 : 75,
        action: evaluation.decision === "deny" ? "blocked" : "sanitized",
        payloadRedacted: redactPayload(`Tool: ${tool} Args: ${JSON.stringify(args)}`, 300),
        payloadHash: computePayloadHash(JSON.stringify(args || {})),
        matchedRules: ["INJ-010"],
        llmCalled: false,
        incidentId: incident._id,
        source: "live",
      });
    }

    return res.status(200).json({
      decision: evaluation.decision,
      reason: evaluation.reason,
      riskTier: evaluation.riskTier,
      incidentId,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate AI Auto-Patch for an incident
 */
export async function generatePatch(req, res, next) {
  try {
    const { id } = req.params;
    const result = await patcherService.createPatchForIncident(id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Apply generated patch to the live gateway
 */
export async function applyPatch(req, res, next) {
  try {
    const { incidentId } = req.body;
    const result = await patcherService.applyPatchToGateway(incidentId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Run Automated Red-Team Security Audit
 */
export async function runAudit(req, res, next) {
  try {
    const { systemPrompt, templateId, mode = "full" } = req.body;

    let targetPrompt = systemPrompt;
    if (!targetPrompt) {
      if (templateId && PROMPT_TEMPLATES[templateId]) {
        targetPrompt = PROMPT_TEMPLATES[templateId].prompt;
      } else {
        const config = await GatewayConfig.getSingleton();
        targetPrompt = config.systemPrompt;
      }
    }

    const auditResult = await scannerService.runSecurityAudit({
      systemPrompt: targetPrompt,
      templateId,
      mode,
      userId: req.user?.id || null,
    });

    return res.status(200).json(auditResult);
  } catch (err) {
    next(err);
  }
}

/**
 * List recent audit reports
 */
export async function getAuditReports(req, res, next) {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const reports = await AuditReport.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      items: reports.map((r) => ({
        ...r,
        id: r._id.toString(),
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Telemetry summary
 */
export async function getTelemetrySummary(req, res, next) {
  try {
    const hours = Number(req.query.hours) || 24;
    const summary = await telemetryService.getSummary(hours);
    return res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

/**
 * Telemetry timeseries
 */
export async function getTelemetryTimeseries(req, res, next) {
  try {
    const hours = Number(req.query.hours) || 24;
    const data = await telemetryService.getTimeseries(hours);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * Telemetry category breakdown
 */
export async function getTelemetryCategories(req, res, next) {
  try {
    const data = await telemetryService.getCategories();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * List threats feed
 */
export async function getThreats(req, res, next) {
  try {
    const { page, limit, severity, category, action } = req.query;
    const data = await telemetryService.getThreats({
      page,
      limit,
      severity,
      category,
      action,
    });
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * Get threat detail with incident forensics
 */
export async function getThreatById(req, res, next) {
  try {
    const data = await telemetryService.getThreatById(req.params.id);
    if (!data) {
      return res.status(404).json({
        error: {
          code: "THREAT_NOT_FOUND",
          message: "The requested threat log entry was not found.",
        },
      });
    }
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * Single Blue-Team AI Defense Assistant Chatbot
 */
export async function chatSingle(req, res, next) {
  const startTime = Date.now();
  try {
    const { message, sessionId = "blue-team-session", history = [] } = req.body;

    // Detect if user requested deeper explanation / more detail
    const isDetailRequested =
      /\b(more detail|more detailed|in detail|detail|elaborate|explain further|deep dive|full explanation|step by step in detail|tell me more|comprehensive|previous manner|expand)\b/i.test(
        message
      );

    // Mask PII
    const piiMaskResult = piiService.maskPii(message, sessionId);

    const blueTeamSystemPrompt = `You are AegisTrust Blue-Team AI Defense Assistant — an expert cyber defense advisor and malware analyst.
Your mission is to defend systems, files, code, and packages from malware, backdoors, reverse shells, and supply-chain exploits.

CRITICAL INSTRUCTIONS ON ANSWER LENGTH:

MODE 1: DEFAULT (ULTRA-SHORT — MAXIMUM 5 LINES)
Unless the user explicitly asks for more detail or an explanation:
- Your entire response MUST BE AT MOST 5 LINES (maximum 5 lines total).
- Cut all greetings, introductory pleasantries, and concluding summaries.
- Provide immediately the core answer or up to 4-5 bullet points.
- Every line must be concise, crisp, and high-impact.

MODE 2: DETAILED MODE (WHEN EXPLICITLY REQUESTED)
When the user asks for "more detail", "more detailed", "in detail", "elaborate", or to explain in the previous manner:
- Provide a full, in-depth, comprehensive technical response.
- Detail the indicators of compromise, exact detection commands, architecture, and step-by-step remediation procedures.
- Use markdown formatting with clear sections, code blocks, and thorough explanations.`;

    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h) => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.content,
        }))
      : [];

    const chatResult = await geminiService.chat({
      systemPrompt: blueTeamSystemPrompt,
      messages: [
        ...formattedHistory,
        { role: "user", content: piiMaskResult.maskedText },
      ],
      model: env.GEMINI_MODEL,
      maxOutputTokens: isDetailRequested ? 1000 : 200,
    });

    const outboundScan = piiService.scanOutbound(chatResult.text);
    const restored = piiService.restorePii(outboundScan.text, sessionId);

    await ThreatLog.create({
      userId: req.user?.id || null,
      sessionId,
      clientIp: req.ip || "127.0.0.1",
      channel: "chat",
      direction: "inbound",
      attackType: "benign",
      severity: "low",
      score: 0,
      action: piiMaskResult.tokenized ? "masked" : "allow",
      payloadRedacted: redactPayload(message, 300),
      payloadHash: computePayloadHash(message),
      piiEntities: piiMaskResult.entities,
      llmCalled: true,
      latencyMs: Date.now() - startTime,
      source: "live",
    });

    return res.status(200).json({
      reply: restored.restoredText,
      pii: {
        entities: piiMaskResult.entities,
        tokenized: piiMaskResult.tokenized,
      },
      engine: chatResult.engine,
      latencyMs: Date.now() - startTime,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Scan file, folder script, or package manifest for malware and supply chain threats
 */
export async function scanMalware(req, res, next) {
  try {
    const { filename, content, mimeType } = req.body;
    const result = await malwareService.scanForMalware({ filename, content, mimeType });

    if (!result.clean) {
      const topFinding = result.findings[0] || {};
      const incident = await Incident.create({
        source: "file",
        payloadRedacted: redactPayload(result.findings.map((f) => `${f.name}: ${f.matchedSnippet}`).join(" | "), 300),
        threatVector: topFinding.category || "Malware",
        confidence: result.riskScore,
        status: "open",
      });

      await ThreatLog.create({
        userId: req.user?.id || null,
        clientIp: req.ip || "127.0.0.1",
        channel: "file",
        direction: "inbound",
        attackType: "sensitive_data",
        severity: result.verdict === "MALICIOUS" ? "critical" : "high",
        score: result.riskScore,
        action: "blocked",
        payloadRedacted: redactPayload(`Infected File: ${filename} - ${result.findings.map((f) => f.name).join(", ")}`, 300),
        payloadHash: computePayloadHash(content),
        matchedRules: result.findings.map((f) => f.id),
        llmCalled: false,
        incidentId: incident._id,
        source: "live",
      });

      result.incidentId = incident._id.toString();
    } else {
      await ThreatLog.create({
        userId: req.user?.id || null,
        clientIp: req.ip || "127.0.0.1",
        channel: "file",
        direction: "inbound",
        attackType: "benign",
        severity: "low",
        score: 0,
        action: "allow",
        payloadRedacted: `Clean file scanned: ${filename}`,
        payloadHash: computePayloadHash(content),
        matchedRules: [],
        llmCalled: false,
        source: "live",
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Cloud Apps & Mail/Drive Malware Inspection Endpoints
 */
export async function getIntegrations(req, res, next) {
  try {
    const list = integrationsService.getIntegrations();
    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
}

export async function connectIntegration(req, res, next) {
  try {
    const { appId, connect, account } = req.body;
    const updated = integrationsService.toggleConnect(appId, { connect, account });
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function syncIntegration(req, res, next) {
  try {
    const { appId } = req.params;
    const result = await integrationsService.syncIntegration(appId, {
      userId: req.user?.id || null,
      clientIp: req.ip || "127.0.0.1",
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getIntegrationItems(req, res, next) {
  try {
    const { appId, status } = req.query;
    const items = integrationsService.getSyncedItems({ appId, status });
    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

export async function scanIntegrationItem(req, res, next) {
  try {
    const { appId, itemName, itemType, content, sourceLocation } = req.body;
    const item = await integrationsService.scanAppItem({
      appId,
      itemName,
      itemType,
      content,
      sourceLocation,
      userId: req.user?.id || null,
      clientIp: req.ip || "127.0.0.1",
    });
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

export async function isolateIntegrationItem(req, res, next) {
  try {
    const { id } = req.params;
    const item = integrationsService.isolateItem(id);
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

/**
 * Security, Privacy & Trust Solution Endpoints
 */
export async function getTrustScorecard(req, res, next) {
  try {
    const scorecard = await trustService.getTrustScorecard();
    return res.status(200).json(scorecard);
  } catch (err) {
    next(err);
  }
}

export async function inspectPrivacyVault(req, res, next) {
  try {
    const { text, sessionId } = req.body;
    const result = trustService.inspectPrivacyVault({ text, sessionId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function analyzeFraud(req, res, next) {
  try {
    const { text, source, sender } = req.body;
    const result = await fraudService.analyzeFraud({ text, source, sender });

    if (result.isFraudulent) {
      await Incident.create({
        source: "email",
        payloadRedacted: redactPayload(`Fraud Vector: ${result.findings.map((f) => f.name).join(", ")}`, 300),
        threatVector: `Financial Fraud: ${result.findings[0]?.category || "Deception"}`,
        confidence: result.fraudRiskScore,
        status: "open",
      });

      trustService.recordTrustEvent({
        action: "FINANCIAL_FRAUD_INTERCEPTED",
        actor: "Fraud Prevention Engine",
        target: `${source || "email"}: ${sender || "inbound"}`,
        details: `Blocked ${result.findings[0]?.name || "BEC Scheme"} with confidence ${result.fraudRiskScore}%.`,
        trustScore: 99,
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getVerifiableAuditLedger(req, res, next) {
  try {
    const ledger = trustService.getVerifiableAuditLedger();
    return res.status(200).json(ledger);
  } catch (err) {
    next(err);
  }
}

export default {
  getHealth,
  chatUnprotected,
  chatProtected,
  chatSingle,
  scanFile,
  scanMalware,
  executeAgentTool,
  generatePatch,
  applyPatch,
  runAudit,
  getAuditReports,
  getTelemetrySummary,
  getTelemetryTimeseries,
  getTelemetryCategories,
  getThreats,
  getThreatById,
  getIntegrations,
  connectIntegration,
  syncIntegration,
  getIntegrationItems,
  scanIntegrationItem,
  isolateIntegrationItem,
  getTrustScorecard,
  inspectPrivacyVault,
  analyzeFraud,
  getVerifiableAuditLedger,
};
