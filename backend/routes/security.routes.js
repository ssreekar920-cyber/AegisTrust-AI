import express from "express";
import { z } from "zod";
import securityController from "../controllers/security.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

const chatUnprotectedSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

const chatProtectedSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

const scanFileSchema = z.object({
  filename: z.string().optional().default("document.txt"),
  mimeType: z.string().optional().default("text/plain"),
  content: z.string().min(1, "File content cannot be empty"),
});

const agentExecuteSchema = z.object({
  tool: z.string().min(1, "Tool name is required"),
  args: z.any().optional(),
  sessionId: z.string().optional(),
});

const applyPatchSchema = z.object({
  incidentId: z.string().min(1, "incidentId is required"),
});

const auditRunSchema = z.object({
  systemPrompt: z.string().optional(),
  templateId: z.string().optional(),
  mode: z.enum(["full", "quick"]).optional().default("full"),
});

// All routes under /api/security require Bearer JWT authentication
router.use(authenticateToken);

router.post("/chat", validate(chatProtectedSchema), securityController.chatSingle);
router.post("/chat/unprotected", validate(chatUnprotectedSchema), securityController.chatUnprotected);
router.post("/chat/protected", validate(chatProtectedSchema), securityController.chatProtected);
router.post("/scan/file", validate(scanFileSchema), securityController.scanFile);
router.post("/malware/scan", validate(scanFileSchema), securityController.scanMalware);
router.post("/agent/execute", validate(agentExecuteSchema), securityController.executeAgentTool);

router.post("/incidents/:id/patch", securityController.generatePatch);
router.post("/patches/apply", validate(applyPatchSchema), securityController.applyPatch);

router.post("/audit/run", validate(auditRunSchema), securityController.runAudit);
router.get("/audit/reports", securityController.getAuditReports);

router.get("/telemetry/summary", securityController.getTelemetrySummary);
router.get("/telemetry/timeseries", securityController.getTelemetryTimeseries);
router.get("/telemetry/categories", securityController.getTelemetryCategories);
router.get("/threats", securityController.getThreats);
router.get("/threats/:id", securityController.getThreatById);

// Cloud Apps, Mail & Drive Malware Inspection Routes
router.get("/integrations", securityController.getIntegrations);
router.post("/integrations/connect", securityController.connectIntegration);
router.post("/integrations/:appId/sync", securityController.syncIntegration);
router.get("/integrations/items", securityController.getIntegrationItems);
router.post("/integrations/items/scan", securityController.scanIntegrationItem);
router.post("/integrations/items/:id/isolate", securityController.isolateIntegrationItem);

// Security, Privacy, Fraud & Trust Solution Routes
router.get("/trust/scorecard", securityController.getTrustScorecard);
router.post("/privacy/inspect", securityController.inspectPrivacyVault);
router.post("/fraud/analyze", securityController.analyzeFraud);
router.get("/trust/audit-trail", securityController.getVerifiableAuditLedger);

export default router;
