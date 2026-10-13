import toolRegistry from "../data/toolRegistry.js";
import { classifyText } from "./detector.service.js";
import { maskPii } from "./pii.service.js";

/**
 * Intercepts and polices autonomous agent function calls to prevent privilege escalation.
 */
export function evaluateToolCall({ tool, args = {}, sessionId = "default-session" }) {
  const toolConfig = toolRegistry[tool];

  if (!toolConfig) {
    return {
      decision: "deny",
      riskTier: "high",
      reason: `Tool '${tool}' is unrecognized and not registered in authorized policy.`,
      attackDetected: false,
      escalated: false,
      createIncident: true,
    };
  }

  // Scan arguments for prompt injection or sensitive data exfiltration
  const serializedArgs = typeof args === "string" ? args : JSON.stringify(args);
  const injectionVerdict = classifyText(serializedArgs);
  const piiVerdict = maskPii(serializedArgs, sessionId);

  let decision = toolConfig.defaultDecision;
  let riskTier = toolConfig.tier;
  let reason = `Tool '${tool}' default security policy for tier '${riskTier}'.`;
  let escalated = false;
  let attackDetected = false;

  if (injectionVerdict.score >= 35 || piiVerdict.tokenized) {
    attackDetected = true;
    escalated = true;

    // Escalate decision by one tier
    if (decision === "allow") {
      decision = "confirm";
      reason = `Escalated to CONFIRM: Suspicious instructions or PII detected in '${tool}' parameters.`;
    } else if (decision === "confirm") {
      decision = "deny";
      reason = `Escalated to DENY: Adversarial injection detected inside '${tool}' arguments.`;
    } else {
      decision = "deny";
      reason = `DENIED: Critical risk tool '${tool}' with adversarial payloads in arguments.`;
    }
  }

  const shouldCreateIncident =
    decision === "deny" || toolConfig.createIncident || attackDetected;

  return {
    decision,
    riskTier,
    reason,
    attackDetected,
    escalated,
    createIncident: shouldCreateIncident,
    owaspId: attackDetected ? "LLM06" : null,
    injectionDetails: injectionVerdict,
  };
}

export default {
  evaluateToolCall,
};
