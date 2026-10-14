const rawBase = import.meta.env.VITE_API_URL || "https://aegis-trust-ai-pg38.vercel.app";
const API_BASE_URL = rawBase.replace(/\/api\/?$/, "").replace(/\/$/, "");

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("at_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.code = data?.error?.code || "REQUEST_FAILED";
      error.details = data?.error?.details || [];
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      const networkError = new Error("Gateway connection failed. Please verify the backend is running.");
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name, email, password) =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  getMe: () => apiRequest("/api/auth/me"),

  // Health
  getHealth: () => apiRequest("/api/health"),

  // Security Chat (Single Blue-Team Chatbot)
  chat: (message, sessionId, history) =>
    apiRequest("/api/security/chat", {
      method: "POST",
      body: JSON.stringify({ message, sessionId, history }),
    }),
  chatUnprotected: (message) =>
    apiRequest("/api/security/chat/unprotected", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  chatProtected: (message, sessionId) =>
    apiRequest("/api/security/chat/protected", {
      method: "POST",
      body: JSON.stringify({ message, sessionId }),
    }),

  // File & Malware Scan
  scanFile: (filename, mimeType, content) =>
    apiRequest("/api/security/scan/file", {
      method: "POST",
      body: JSON.stringify({ filename, mimeType, content }),
    }),
  scanMalware: (filename, mimeType, content) =>
    apiRequest("/api/security/malware/scan", {
      method: "POST",
      body: JSON.stringify({ filename, mimeType, content }),
    }),

  // Agent Tool Interceptor
  executeTool: (tool, args, sessionId) =>
    apiRequest("/api/security/agent/execute", {
      method: "POST",
      body: JSON.stringify({ tool, args, sessionId }),
    }),

  // Incidents & Patches
  generatePatch: (incidentId) =>
    apiRequest(`/api/security/incidents/${incidentId}/patch`, {
      method: "POST",
    }),
  applyPatch: (incidentId) =>
    apiRequest("/api/security/patches/apply", {
      method: "POST",
      body: JSON.stringify({ incidentId }),
    }),

  // Red-Team Audit
  runAudit: (payload) =>
    apiRequest("/api/security/audit/run", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAuditReports: (limit = 10) =>
    apiRequest(`/api/security/audit/reports?limit=${limit}`),

  // Telemetry
  getSummary: (hours = 24) =>
    apiRequest(`/api/security/telemetry/summary?hours=${hours}`),
  getTimeseries: (hours = 24) =>
    apiRequest(`/api/security/telemetry/timeseries?hours=${hours}`),
  getCategories: () =>
    apiRequest("/api/security/telemetry/categories"),
  getThreats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/security/threats?${query}`);
  },
  getThreatById: (id) =>
    apiRequest(`/api/security/threats/${id}`),

  // Cloud Apps & Mail/Drive Integrations
  getIntegrations: () => apiRequest("/api/security/integrations"),
  connectIntegration: (appId, connect = true, account = null) =>
    apiRequest("/api/security/integrations/connect", {
      method: "POST",
      body: JSON.stringify({ appId, connect, account }),
    }),
  syncIntegration: (appId) =>
    apiRequest(`/api/security/integrations/${appId}/sync`, {
      method: "POST",
    }),
  getIntegrationItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/security/integrations/items?${query}`);
  },
  scanIntegrationItem: (payload) =>
    apiRequest("/api/security/integrations/items/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  isolateIntegrationItem: (id) =>
    apiRequest(`/api/security/integrations/items/${id}/isolate`, {
      method: "POST",
    }),

  // Security, Privacy & Trust Solution APIs
  getTrustScorecard: () => apiRequest("/api/security/trust/scorecard"),
  inspectPrivacyVault: (text, sessionId = "privacy-session") =>
    apiRequest("/api/security/privacy/inspect", {
      method: "POST",
      body: JSON.stringify({ text, sessionId }),
    }),
  analyzeFraud: (text, source = "email", sender = "unknown") =>
    apiRequest("/api/security/fraud/analyze", {
      method: "POST",
      body: JSON.stringify({ text, source, sender }),
    }),
  getVerifiableAuditLedger: () => apiRequest("/api/security/trust/audit-trail"),
};

export default api;
