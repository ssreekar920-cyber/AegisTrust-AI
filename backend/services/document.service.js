import { classifyText } from "./detector.service.js";
import { redactPayload } from "../utils/redact.js";

/**
 * Extracts and checks URLs for suspicious indicators without fetching them.
 */
export function extractAndCheckUrls(text) {
  const urlRegex = /https?:\/\/[^\s<>"'{}|\\^`[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  const urlFindings = [];

  for (const urlStr of matches) {
    try {
      const parsed = new URL(urlStr);
      const host = parsed.hostname;
      const issues = [];

      // Check for IP-literal host
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
        issues.push("IP-literal host instead of domain");
      }

      // Check for embedded credentials
      if (parsed.username || parsed.password) {
        issues.push("Embedded user credentials in URL");
      }

      // Check for punycode / IDN homograph indicator
      if (host.startsWith("xn--")) {
        issues.push("Punycode / internationalized domain (potential homograph)");
      }

      // Check for suspicious suspicious subdomains or keywords
      if (host.includes("login") || host.includes("verify") || host.includes("update") || host.includes("security")) {
        if (!host.endsWith(".google.com") && !host.endsWith(".microsoft.com")) {
          issues.push("Suspicious security/login spoofing keyword in domain");
        }
      }

      if (issues.length > 0) {
        urlFindings.push({
          source: "url_heuristic",
          vector: "Suspicious URL Structure",
          severity: "medium",
          snippetRedacted: redactPayload(urlStr, 60),
          indicators: issues,
          threatIntelStatus: "not_checked",
          note: `Indicators: ${issues.join("; ")} (Threat intel reputation: not_checked)`,
        });
      }
    } catch {
      // Invalid URL format
    }
  }

  return urlFindings;
}

/**
 * Scans uploaded document or pasted RAG text for indirect prompt injection,
 * hidden markup, zero-width characters, and suspicious indicators.
 */
export function scanDocument({ filename = "document.txt", mimeType = "text/plain", content = "" }) {
  if (!content) {
    return {
      clean: true,
      findings: [],
      hiddenCharactersRemoved: 0,
      sanitizedContent: "",
      normalizedPreview: "",
    };
  }

  let text = content;
  // If base64 encoded document
  if (mimeType !== "text/plain" && !content.includes(" ") && content.length > 50) {
    try {
      const decoded = Buffer.from(content, "base64").toString("utf-8");
      if (/^[\x20-\x7E\s\r\n\t]+$/.test(decoded.slice(0, 100))) {
        text = decoded;
      }
    } catch {
      // Keep original text
    }
  }

  const findings = [];
  let hiddenCharactersRemoved = 0;

  // 1. Zero-width and hidden unicode characters
  const zwRegex = /[\u200B-\u200D\u200E\u200F\uFEFF]/g;
  const zwMatches = text.match(zwRegex);
  if (zwMatches) {
    hiddenCharactersRemoved = zwMatches.length;
    text = text.replace(zwRegex, "");
    findings.push({
      source: "local_rule",
      vector: "Zero-Width Unicode Injection",
      severity: "high",
      matchedRule: "INJ-008",
      snippetRedacted: `[Detected ${hiddenCharactersRemoved} zero-width unicode characters]`,
      note: "Removed invisible characters often used for steganographic instruction embedding.",
    });
  }

  // 2. Hidden text CSS markers and HTML comments
  const hiddenCssMarkers = [
    { pattern: /color\s*:\s*(?:#fff(?:fff)?|white)/gi, name: "White-on-white hidden text" },
    { pattern: /font-size\s*:\s*0(?:px)?/gi, name: "Zero font-size hidden text" },
    { pattern: /display\s*:\s*none/gi, name: "Display none hidden text" },
    { pattern: /visibility\s*:\s*hidden/gi, name: "Visibility hidden element" },
    { pattern: /opacity\s*:\s*0/gi, name: "Zero opacity hidden text" },
  ];

  for (const marker of hiddenCssMarkers) {
    if (marker.pattern.test(text)) {
      findings.push({
        source: "local_rule",
        vector: "Hidden CSS Element Injection",
        severity: "high",
        matchedRule: "INJ-008",
        snippetRedacted: marker.name,
        note: `Suspicious styling (${marker.name}) hiding instructions from human readers.`,
      });
    }
  }

  // HTML comments inspection: comments > 40 chars or containing instruction verbs
  const htmlCommentRegex = /<!--([\s\S]*?)-->/g;
  let commentMatch;
  let sanitizedText = text;

  while ((commentMatch = htmlCommentRegex.exec(text)) !== null) {
    const commentBody = commentMatch[1].trim();
    const hasInstructionVerb = /(?:ignore|disregard|system|prompt|instruction|forward|email|send|override|exfiltrate)/i.test(commentBody);

    if (commentBody.length > 40 || hasInstructionVerb) {
      findings.push({
        source: "local_rule",
        vector: "Adversarial HTML Comment Injection",
        severity: "critical",
        matchedRule: "INJ-008",
        snippetRedacted: redactPayload(commentBody, 100),
        note: "HTML comment containing adversarial guidance or excessive hidden payload.",
      });
      // Neutralize/remove the comment
      sanitizedText = sanitizedText.replace(commentMatch[0], " [SANITIZED: hidden comment removed] ");
    }
  }

  // 3. Run primary injection classification on the text
  const textClassification = classifyText(sanitizedText);
  if (textClassification.score >= 35) {
    for (const ev of textClassification.evidence) {
      findings.push({
        source: ev.source,
        vector: `Indirect Injection: ${ev.label}`,
        severity: ev.severity,
        matchedRule: ev.ruleId,
        snippetRedacted: ev.snippetRedacted,
        note: ev.explanation,
      });
    }
    sanitizedText = textClassification.sanitizedText;
  }

  // 4. URL indicators extraction
  const urlFindings = extractAndCheckUrls(text);
  findings.push(...urlFindings);

  const isClean = findings.length === 0;

  return {
    clean: isClean,
    findings,
    hiddenCharactersRemoved,
    sanitizedContent: sanitizedText,
    normalizedPreview: sanitizedText.slice(0, 200).replace(/\s+/g, " ").trim(),
  };
}

export default {
  scanDocument,
  extractAndCheckUrls,
};
