import { piiPatterns } from "../data/piiPatterns.js";
import { redactPayload } from "../utils/redact.js";

// In-memory session store: Map<sessionId, Map<token, { value, type, expiresAt }>>
const sessionTokenStore = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_TOKENS_PER_SESSION = 200;

// Periodic cleanup of expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, tokenMap] of sessionTokenStore.entries()) {
    for (const [token, data] of tokenMap.entries()) {
      if (data.expiresAt < now) {
        tokenMap.delete(token);
      }
    }
    if (tokenMap.size === 0) {
      sessionTokenStore.delete(sessionId);
    }
  }
}, 5 * 60 * 1000).unref();

export function clearSessionPii(sessionId) {
  sessionTokenStore.delete(sessionId);
}

function getSessionMap(sessionId) {
  if (!sessionTokenStore.has(sessionId)) {
    sessionTokenStore.set(sessionId, new Map());
  }
  return sessionTokenStore.get(sessionId);
}

/**
 * Stage 3: Inbound PII Masking
 * Scans text, replaces detected PII with [[PII_<TYPE>_<n>]], and saves to session token map.
 */
export function maskPii(text, sessionId = "default-session") {
  if (!text || typeof text !== "string") {
    return {
      maskedText: text || "",
      entities: [],
      tokenized: false,
      tokenCount: 0,
    };
  }

  const sessionMap = getSessionMap(sessionId);
  let currentText = text;
  const entitiesFound = [];
  const typeCounters = {};

  for (const patternConfig of piiPatterns) {
    const { type, regex, validate } = patternConfig;
    let match;
    const matches = [];

    // Reset regex index
    regex.lastIndex = 0;
    while ((match = regex.exec(currentText)) !== null) {
      const matchedValue = match[0];
      if (validate && !validate(matchedValue)) {
        continue;
      }
      matches.push(matchedValue);
    }

    if (matches.length > 0) {
      // Deduplicate matches to preserve token numbering
      const uniqueMatches = [...new Set(matches)];
      let count = 0;

      for (const val of uniqueMatches) {
        typeCounters[type] = (typeCounters[type] || 0) + 1;
        const token = `[[PII_${type}_${typeCounters[type]}]]`;

        if (sessionMap.size < MAX_TOKENS_PER_SESSION) {
          sessionMap.set(token, {
            value: val,
            type,
            highRiskSecret: !!patternConfig.highRiskSecret,
            expiresAt: Date.now() + SESSION_TTL_MS,
          });
        }

        // Replace all instances of this exact match
        currentText = currentText.split(val).join(token);
        count += (text.split(val).length - 1);
      }

      entitiesFound.push({
        type,
        count: count || matches.length,
        sample: redactPayload(uniqueMatches[0], 40),
        highRiskSecret: !!patternConfig.highRiskSecret,
      });
    }
  }

  return {
    maskedText: currentText,
    entities: entitiesFound,
    tokenized: entitiesFound.length > 0,
    tokenCount: entitiesFound.reduce((acc, curr) => acc + curr.count, 0),
  };
}

/**
 * Stage 5: Outbound Scan
 * Checks AI model response for un-tokenized sensitive secrets (API keys, SSNs, credit cards, passwords).
 * Masks them before client receives them.
 */
export function scanOutbound(text) {
  if (!text || typeof text !== "string") return { text: "", leakedEntities: [] };

  let sanitized = text;
  const leakedEntities = [];

  for (const patternConfig of piiPatterns) {
    const { type, regex, validate } = patternConfig;
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(sanitized)) !== null) {
      const matchedValue = match[0];
      if (validate && !validate(matchedValue)) continue;

      leakedEntities.push(type);
      sanitized = sanitized.split(matchedValue).join(`[PII Masked: ${type}]`);
    }
  }

  // Also check for AIza... or sk-... patterns specifically
  sanitized = sanitized.replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{30,})\b/g, "[SECRET_KEY_MASKED]");

  return {
    text: sanitized,
    leakedEntities: [...new Set(leakedEntities)],
  };
}

/**
 * Stage 6: Restore PII
 * Replaces [[PII_<TYPE>_<n>]] with original values ONLY if present in session map
 * AND ONLY IF NOT A HIGH-RISK SECRET (API keys, passwords, full credit cards, SSN, Aadhaar are NEVER restored into AI replies).
 */
export function restorePii(text, sessionId = "default-session") {
  if (!text || typeof text !== "string") {
    return { restoredText: text || "", restoredCount: 0 };
  }

  const sessionMap = getSessionMap(sessionId);
  let result = text;
  let restoredCount = 0;

  // Find all tokens in text: [[PII_TYPE_N]]
  const tokenRegex = /\[\[PII_([A-Z_]+)_(\d+)\]\]/g;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    const token = match[0];
    const item = sessionMap.get(token);

    if (item) {
      // Invariant: Never restore high-risk secrets (API keys, SSN, Credit Cards, Aadhaar)
      if (item.highRiskSecret) {
        // Leave masked or replace with safe redacted representation
        const safeRedacted = redactPayload(item.value, 40);
        result = result.split(token).join(safeRedacted);
      } else {
        // Safe to restore (e.g. Email, Phone, IP)
        result = result.split(token).join(item.value);
        restoredCount++;
      }
    }
    // If unknown token created by model hallucination, it remains masked!
  }

  return {
    restoredText: result,
    restoredCount,
  };
}

export default {
  maskPii,
  scanOutbound,
  restorePii,
  clearSessionPii,
};
