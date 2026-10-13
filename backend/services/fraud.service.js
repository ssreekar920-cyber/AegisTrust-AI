import { redactPayload } from "../utils/redact.js";
import logger from "../utils/logger.js";

/**
 * AI-Powered Fraud Prevention & Financial Threat Detection Engine
 * Identifies Business Email Compromise (BEC), wire transfer redirection,
 * invoice tampering, credential phishing, and account takeover indicators.
 */

export const fraudSignatures = [
  {
    id: "FRAUD-BEC-001",
    name: "Business Email Compromise (BEC) / Executive Impersonation",
    category: "Executive Impersonation",
    severity: "critical",
    patterns: [
      /(?:CEO|CFO|Director|President|Executive)\s+(?:requests|requires|needs)\s+(?:urgent|immediate|confidential)\s+(?:wire|transfer|payment)/i,
      /(?:keep this strictly confidential|do not discuss with others|internal audit will follow)/i,
      /(?:acting on behalf of|authorized by the CEO|urgent request from leadership)/i,
    ],
    description: "Impersonates C-level executives requesting urgent, out-of-band wire payments or confidential gift cards.",
  },
  {
    id: "FRAUD-WIRE-002",
    name: "Wire Routing & Bank Account Redirection Tampering",
    category: "Payment Redirection",
    severity: "critical",
    patterns: [
      /(?:updated|new|revised|changed)\s+(?:banking|wire|routing|account|remittance)\s+(?:details|information|instructions|numbers)/i,
      /(?:please update our account to|payments must now be sent to|new beneficiary account)/i,
      /(?:routing\s*#?:\s*\d{9}|iban\s*:\s*[A-Z]{2}\d{2}[A-Z0-9]{11,30})/i,
    ],
    description: "Attempts to divert legitimate invoice payments or payroll to unauthorized cybercriminal bank accounts.",
  },
  {
    id: "FRAUD-PHISH-003",
    name: "Urgent Payment / Fake Invoice Phishing Scheme",
    category: "Invoice Phishing",
    severity: "high",
    patterns: [
      /(?:overdue|final notice|immediate payment required|account suspension warning)\s+.*?(?:within\s+\d+\s+hours|penalty|legal action)/i,
      /(?:click here to pay|view your invoice at|verify your payment portal)\s*https?:\/\//i,
      /\b(?:wire|ach|remittance)\s+of\s+\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?\b/i,
    ],
    description: "Uses artificial urgency and psychological coercion to force hasty authorization of fraudulent invoices.",
  },
  {
    id: "FRAUD-CREDS-004",
    name: "Credential Harvest / Account Takeover (ATO) Ingress",
    category: "Credential Theft",
    severity: "critical",
    patterns: [
      /(?:verify your credentials|password expiry notice|re-authenticate your Microsoft 365|confirm your login)/i,
      /(?:data:text\/html|https?:\/\/[a-z0-9-]+\.(?:xyz|top|ru|pw|cfd|click)\/login)/i,
      /(?:session expired|security alert: unauthorized sign-in detected)\s*.*?https?:\/\//i,
    ],
    description: "Spoofs single-sign-on (SSO) login portals to harvest corporate access tokens and multi-factor credentials.",
  },
  {
    id: "FRAUD-SUPPLY-005",
    name: "Vendor Bank Detail Tampering & Discrepancy",
    category: "Vendor Fraud",
    severity: "high",
    patterns: [
      /(?:vendor bank audit|temporary bank account due to audit|payment partner switch)/i,
      /(?:swift|bic)\s*:\s*[A-Z]{6}[A-Z0-9]{2,5}/i,
    ],
    description: "Falsely claims supplier bank account changes due to mergers, banking upgrades, or internal tax audits.",
  },
];

/**
 * Analyzes an email, transaction instruction, invoice, or message for fraud indicators
 */
export async function analyzeFraud({ text = "", source = "email", sender = "unknown" }) {
  if (!text || text.trim().length === 0) {
    return {
      fraudRiskScore: 0,
      verdict: "BENIGN",
      isFraudulent: false,
      findings: [],
      explanation: "No content provided for fraud inspection.",
      remediation: "Verify sender authenticity using SPF, DKIM, and DMARC records.",
    };
  }

  const findings = [];
  let highestScore = 0;

  for (const sig of fraudSignatures) {
    let matched = false;
    let snippet = "";

    for (const pattern of sig.patterns) {
      const match = pattern.exec(text);
      if (match) {
        matched = true;
        snippet = match[0];
        break;
      }
    }

    if (matched) {
      const score = sig.severity === "critical" ? 95 : 75;
      if (score > highestScore) highestScore = score;

      findings.push({
        id: sig.id,
        name: sig.name,
        category: sig.category,
        severity: sig.severity,
        description: sig.description,
        matchedEvidence: redactPayload(snippet, 120),
      });
    }
  }

  const isFraudulent = findings.length > 0;
  const fraudRiskScore = isFraudulent ? highestScore : 0;
  const verdict = fraudRiskScore >= 90 ? "CRITICAL_FRAUD" : fraudRiskScore > 50 ? "SUSPICIOUS_FRAUD" : "BENIGN";

  const explanation = isFraudulent
    ? `Flagged ${findings.length} fraud pattern(s) in communication from '${sender}'. Identified indicators: ${findings.map((f) => f.name).join(", ")}. Primary vector is ${findings[0]?.category || "financial deception"}.`
    : "Communication screened: No executive impersonation, payment redirection, or credential harvest signatures detected. Message appears legitimate.";

  const remediation = isFraudulent
    ? "1. HALT PAYMENT IMMEDIATELY: Do not authorize wire transfers or bank account changes.\n2. OUT-OF-BAND VERIFICATION: Call the vendor or executive directly via an established, pre-recorded phone number.\n3. SECURE MAILBOX: Verify DKIM/SPF headers to confirm whether sender email was spoofed.\n4. QUARANTINE: Isolate email and report incident to SecOps Financial Fraud Response unit."
    : "Standard verification completed. Proceed with routine invoice reconciliation procedures.";

  logger.info("fraud_analyzed", {
    source,
    sender,
    verdict,
    fraudRiskScore,
    findingsCount: findings.length,
  });

  return {
    fraudRiskScore,
    verdict,
    isFraudulent,
    findings,
    explanation,
    remediation,
    source,
    sender,
    timestamp: new Date().toISOString(),
  };
}

export default {
  analyzeFraud,
  fraudSignatures,
};
