import crypto from "crypto";

/**
 * Redacts sensitive tokens and patterns from a string for safe display and logging.
 * Replaces emails, cards, keys with safe masked representations.
 * Truncates to maxLength characters, appending '…' if truncated.
 */
export function redactPayload(rawText, maxLength = 500) {
  if (!rawText || typeof rawText !== "string") return "";

  let sanitized = rawText
    // Redact Emails: john.doe@example.com -> j***@e***.com
    .replace(/\b([A-Za-z0-9])[A-Za-z0-9._%+-]*@([A-Za-z0-9])[A-Za-z0-9.-]*\.(com|org|net|io|co|in|[a-z]{2,})\b/gi, "$1***@$2***.$3")
    // Redact Credit Cards
    .replace(/\b(?:\d{4}[ -]?){3}(\d{4})\b/g, "****-****-****-$1")
    // Redact SSN
    .replace(/\b\d{3}-\d{2}-(\d{4})\b/g, "***-**-$1")
    // Redact Aadhaar
    .replace(/\b\d{4}\s?\d{4}\s?(\d{4})\b/g, "XXXX-XXXX-$1")
    // Redact API Keys
    .replace(/\b(sk-|AIza|ghp_)[A-Za-z0-9_-]{10,}\b/g, "$1[REDACTED_KEY]")
    // Redact Passwords in key-value format
    .replace(/(password|secret|token)\s*[:=]\s*[^\s,]+/gi, "$1=[REDACTED]");

  if (sanitized.length > maxLength) {
    return sanitized.slice(0, maxLength) + "…";
  }
  return sanitized;
}

/**
 * Computes sha256 hexadecimal hash of input text.
 */
export function computePayloadHash(rawText) {
  if (!rawText) return "";
  return crypto.createHash("sha256").update(String(rawText)).digest("hex");
}

export default {
  redactPayload,
  computePayloadHash,
};
