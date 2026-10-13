/**
 * PII pattern definitions and validation logic.
 * Enforces bidirectional masking rules.
 */

// Luhn algorithm validator for credit cards
export function passesLuhn(cardNumberStr) {
  const digits = cardNumberStr.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = n - 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export const piiPatterns = [
  {
    type: "API_KEY",
    label: "API Key",
    regex: /\b(?:sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{30,}|ghp_[A-Za-z0-9]{20,})\b/g,
    highRiskSecret: true,
  },
  {
    type: "CREDIT_CARD",
    label: "Credit Card",
    // 13-19 digits with optional spaces or dashes
    regex: /\b(?:\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{1,7}|\d{4}[ -]?\d{6}[ -]?\d{5})\b/g,
    validate: (match) => passesLuhn(match),
    highRiskSecret: true,
  },
  {
    type: "SSN",
    label: "SSN",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    highRiskSecret: true,
  },
  {
    type: "AADHAAR",
    label: "Aadhaar Number",
    regex: /\b(?:aadhaar\D{0,10})?(\d{4}\s?\d{4}\s?\d{4})\b/gi,
    extract: (match) => match.replace(/\D/g, "").slice(-12),
    highRiskSecret: true,
  },
  {
    type: "EMAIL",
    label: "Email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    highRiskSecret: false,
  },
  {
    type: "PHONE",
    label: "Phone",
    regex: /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\+\d{7,15}\b/g,
    highRiskSecret: false,
  },
  {
    type: "IP",
    label: "IP Address",
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    validate: (match) => {
      if (match === "127.0.0.1" || match === "0.0.0.0") return false;
      const parts = match.split(".").map(Number);
      return parts.every((p) => p >= 0 && p <= 255);
    },
    highRiskSecret: false,
  },
];

export default piiPatterns;
