import injectionRules from "../data/injectionRules.js";
import { redactPayload } from "../utils/redact.js";

/**
 * Normalizes input text by removing zero-width characters, normalizing unicode,
 * collapsing redundant whitespace, and inspecting base64 strings.
 */
export function normalizeText(text) {
  if (!text || typeof text !== "string") {
    return { raw: "", normalized: "", base64Decoded: [] };
  }

  // 1. Unicode normalization (NFKC)
  let norm = text.normalize("NFKC");

  // 2. Strip zero-width and invisible characters
  // \u200B (Zero-width space), \u200C (ZWNJ), \u200D (ZWJ), \uFEFF (BOM), \u200E, \u200F
  norm = norm.replace(/[\u200B-\u200D\u200E\u200F\uFEFF]/g, "");

  // 3. Search and decode potential base64 strings >= 24 chars
  const base64Regex = /\b[A-Za-z0-9+/]{24,}={0,2}\b/g;
  const base64Decoded = [];
  let bMatch;
  while ((bMatch = base64Regex.exec(text)) !== null) {
    try {
      const decoded = Buffer.from(bMatch[0], "base64").toString("utf-8");
      // Only keep if looks like printable text
      if (/^[\x20-\x7E\s]+$/.test(decoded) && decoded.length > 8) {
        base64Decoded.push({ raw: bMatch[0], decoded });
      }
    } catch {
      // Not valid base64 or decoding error
    }
  }

  // 4. Whitespace collapse
  const collapsed = norm.replace(/\s+/g, " ").trim();

  return {
    raw: text,
    normalized: collapsed,
    base64Decoded,
  };
}

/**
 * Maps numeric score to severity enum:
 * >= 85 Critical · 60-84 High · 35-59 Medium · < 35 Low
 */
export function calculateSeverity(score) {
  if (score >= 85) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

/**
 * Evaluates text against injection rules and returns verdict, score, matched rules, and evidence.
 * PURE function with no side effects.
 */
export function classifyText(inputText) {
  const { raw, normalized, base64Decoded } = normalizeText(inputText);

  if (!normalized) {
    return {
      score: 0,
      severity: "low",
      category: "benign",
      owaspId: null,
      action: "allow",
      blocked: false,
      matchedRules: [],
      evidence: [],
      sanitizedText: raw,
      normalizedPreview: "",
    };
  }

  const matchedRules = [];
  const evidence = [];
  let scoreAccumulator = 0;
  let highestWeight = 0;
  let primaryCategory = "benign";
  let primaryOwaspId = null;

  // Scan normalized text
  for (const rule of injectionRules) {
    let matched = false;
    let snippet = "";

    for (const pattern of rule.patterns) {
      const match = pattern.exec(normalized);
      if (match) {
        matched = true;
        snippet = match[0];
        break;
      }
    }

    // Also check base64 decoded strings
    if (!matched && base64Decoded.length > 0) {
      for (const b of base64Decoded) {
        for (const pattern of rule.patterns) {
          const bMatch = pattern.exec(b.decoded);
          if (bMatch) {
            matched = true;
            snippet = `[Decoded base64]: ${bMatch[0]}`;
            break;
          }
        }
        if (matched) break;
      }
    }

    if (matched) {
      matchedRules.push(rule.id);
      scoreAccumulator += rule.weight;

      if (rule.weight > highestWeight) {
        highestWeight = rule.weight;
        primaryCategory = rule.category;
        primaryOwaspId = rule.owaspId;
      }

      evidence.push({
        source: "local_rule",
        ruleId: rule.id,
        label: rule.name,
        snippetRedacted: redactPayload(snippet, 80),
        explanation: rule.description,
        severity: calculateSeverity(rule.weight),
      });
    }
  }

  const score = Math.min(100, scoreAccumulator);
  const severity = calculateSeverity(score);

  // Inbound decision:
  // score >= 85 -> BLOCK; 35-84 -> SANITIZE; < 35 -> ALLOW
  let action = "allow";
  let blocked = false;
  let sanitizedText = raw;

  if (score >= 85) {
    action = "blocked";
    blocked = true;
  } else if (score >= 35) {
    action = "sanitized";
    // Strip offending phrases from text
    let temp = raw;
    for (const rule of injectionRules) {
      if (matchedRules.includes(rule.id)) {
        for (const pattern of rule.patterns) {
          temp = temp.replace(new RegExp(pattern.source, "gi"), "[REMOVED_INSTRUCTION]");
        }
      }
    }
    sanitizedText = temp;
  }

  return {
    score,
    severity,
    category: score > 0 ? primaryCategory : "benign",
    owaspId: score > 0 ? primaryOwaspId : null,
    action,
    blocked,
    matchedRules,
    evidence,
    sanitizedText,
    normalizedPreview: normalized.slice(0, 150),
  };
}

export default {
  normalizeText,
  calculateSeverity,
  classifyText,
};
