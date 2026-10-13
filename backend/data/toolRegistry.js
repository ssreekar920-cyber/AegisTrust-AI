/**
 * Agentic Tool Registry defining risk tiers and authorization policies.
 */

export const toolRegistry = {
  "db.read": {
    name: "db.read",
    description: "Read records from application database collections",
    tier: "low",
    defaultDecision: "allow",
  },
  "fs.read": {
    name: "fs.read",
    description: "Read allowed local files within application sandbox",
    tier: "low",
    defaultDecision: "allow",
  },
  "db.write": {
    name: "db.write",
    description: "Insert or modify database records",
    tier: "medium",
    defaultDecision: "confirm",
  },
  "fs.write": {
    name: "fs.write",
    description: "Create or modify sandbox file contents",
    tier: "medium",
    defaultDecision: "confirm",
  },
  "http.fetch": {
    name: "http.fetch",
    description: "Perform outbound HTTP GET/POST requests",
    tier: "medium",
    defaultDecision: "confirm",
  },
  "email.send": {
    name: "email.send",
    description: "Dispatch email message to external recipients",
    tier: "medium",
    defaultDecision: "confirm",
  },
  "shell.exec": {
    name: "shell.exec",
    description: "Execute arbitrary OS shell instructions or commands",
    tier: "high",
    defaultDecision: "deny",
  },
  "secrets.read": {
    name: "secrets.read",
    description: "Extract application vault secrets and environment variables",
    tier: "critical",
    defaultDecision: "deny",
    createIncident: true,
  },
  "db.drop": {
    name: "db.drop",
    description: "Drop database collections or entire schema",
    tier: "critical",
    defaultDecision: "deny",
    createIncident: true,
  },
};

export default toolRegistry;
