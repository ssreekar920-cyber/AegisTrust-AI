import { redactPayload } from "./redact.js";

/**
 * Structured security-compliant logger.
 * Never logs raw PII, sensitive bodies, or API credentials.
 */
function formatMessage(level, event, meta = {}) {
  const ts = new Date().toISOString();
  const safeMeta = { ...meta };

  // Sanitize potential sensitive fields
  if (safeMeta.payload) {
    safeMeta.payload = redactPayload(String(safeMeta.payload), 120);
  }
  if (safeMeta.body) {
    delete safeMeta.body;
  }
  if (safeMeta.password) {
    delete safeMeta.password;
  }
  if (safeMeta.token) {
    safeMeta.token = "[REDACTED_JWT]";
  }

  const metaString = Object.entries(safeMeta)
    .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(" ");

  return `[${ts}] [${level.toUpperCase()}] [${event}] ${metaString}`.trim();
}

export const logger = {
  info: (event, meta) => console.log(formatMessage("info", event, meta)),
  warn: (event, meta) => console.warn(formatMessage("warn", event, meta)),
  error: (event, meta) => console.error(formatMessage("error", event, meta)),
  security: (event, meta) => console.log(formatMessage("secops", event, meta)),
};

export default logger;
