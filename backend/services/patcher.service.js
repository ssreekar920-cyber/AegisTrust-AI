import GatewayConfig from "../models/gatewayConfig.model.js";
import Incident from "../models/incident.model.js";
import geminiService from "./gemini.service.js";
import logger from "../utils/logger.js";

/**
 * Generates an auto-patch for an incident using Gemini
 */
export async function createPatchForIncident(incidentId) {
  const incident = await Incident.findById(incidentId);
  if (!incident) {
    throw new Error(`Incident '${incidentId}' not found`);
  }

  const gatewayConfig = await GatewayConfig.getSingleton();

  const patchResult = await geminiService.patch({
    attackRedacted: incident.payloadRedacted,
    category: incident.threatVector,
    matchedRules: [incident.threatVector],
    currentSystemPrompt: gatewayConfig.systemPrompt,
  });

  incident.patch = {
    systemPrompt: patchResult.patchedSystemPrompt,
    rationale: patchResult.patchLines,
    appliedAt: null,
    version: null,
  };
  await incident.save();

  return {
    patch: {
      systemPrompt: patchResult.patchedSystemPrompt,
      rationale: patchResult.patchLines,
      diagnosis: patchResult.diagnosis,
      vulnerableInstruction: patchResult.vulnerableInstruction,
    },
    incidentId: incident._id.toString(),
    version: gatewayConfig.version,
  };
}

/**
 * Applies a generated patch to the gateway singleton configuration
 */
export async function applyPatchToGateway(incidentId) {
  const incident = await Incident.findById(incidentId);
  if (!incident || !incident.patch || !incident.patch.systemPrompt) {
    throw new Error("No generated patch found for this incident");
  }

  const gatewayConfig = await GatewayConfig.getSingleton();

  // Increment version: v1 -> v2
  const currentNum = parseInt(gatewayConfig.version.replace(/\D/g, "") || "1", 10);
  const nextVersion = `v${currentNum + 1}`;

  gatewayConfig.systemPrompt = incident.patch.systemPrompt;
  gatewayConfig.version = nextVersion;
  gatewayConfig.updatedAt = new Date();
  gatewayConfig.history.push({
    version: nextVersion,
    systemPrompt: incident.patch.systemPrompt,
    reason: `Auto-patch applied from incident ${incident._id} (${incident.threatVector})`,
    source: "auto-patch",
    createdAt: new Date(),
  });

  await gatewayConfig.save();

  // Update incident status
  incident.status = "patched";
  incident.patch.appliedAt = new Date();
  incident.patch.version = nextVersion;
  await incident.save();

  logger.security("gateway_prompt_patched", {
    incidentId: incident._id.toString(),
    previousVersion: `v${currentNum}`,
    newVersion: nextVersion,
  });

  return {
    gateway: {
      version: nextVersion,
      updatedAt: gatewayConfig.updatedAt,
      systemPrompt: gatewayConfig.systemPrompt,
    },
  };
}

export default {
  createPatchForIncident,
  applyPatchToGateway,
};
