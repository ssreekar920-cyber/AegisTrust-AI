/**
 * ThreatLog model — Supabase shim
 * Replaces Mongoose ThreatLog model with Supabase PostgreSQL operations.
 */
import { getSupabaseClient } from "../config/supabase.js";
import { randomUUID } from "crypto";

const TABLE = "threat_logs";

function mapRow(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    id: row.id,
    toJSON() { return this; },
  };
}

const ThreatLog = {
  async create(data) {
    const sb = getSupabaseClient();
    if (!sb) return { _id: randomUUID(), ...data };
    try {
      const { data: row, error } = await sb
        .from(TABLE)
        .insert({
          id: randomUUID(),
          ts: new Date().toISOString(),
          user_id: data.userId || null,
          session_id: data.sessionId || "default-session",
          client_ip: data.clientIp || "127.0.0.1",
          channel: data.channel,
          direction: data.direction || "inbound",
          attack_type: data.attackType,
          owasp_id: data.owaspId || null,
          severity: data.severity || "low",
          score: data.score || 0,
          action: data.action,
          payload_redacted: (data.payloadRedacted || "").slice(0, 500),
          payload_hash: data.payloadHash || "",
          pii_entities: JSON.stringify(data.piiEntities || []),
          matched_rules: JSON.stringify(data.matchedRules || []),
          llm_called: data.llmCalled || false,
          incident_id: data.incidentId ? String(data.incidentId) : null,
          latency_ms: data.latencyMs || 0,
          source: data.source || "live",
        })
        .select()
        .single();
      if (error) {
        console.warn("⚠️ ThreatLog insert warning:", error.message);
        return { _id: randomUUID(), ...data };
      }
      return mapRow(row);
    } catch (err) {
      console.warn("⚠️ ThreatLog create skipped:", err.message);
      return { _id: randomUUID(), ...data };
    }
  },

  async countDocuments(filter = {}) {
    const sb = getSupabaseClient();
    if (!sb) return 0;
    try {
      let query = sb.from(TABLE).select("id", { count: "exact", head: true });
      if (filter.action) query = query.eq("action", filter.action);
      const { count } = await query;
      return count || 0;
    } catch { return 0; }
  },

  async find(filter = {}) {
    const sb = getSupabaseClient();
    if (!sb) return [];
    try {
      let query = sb.from(TABLE).select("*").order("ts", { ascending: false }).limit(500);
      if (filter.ts?.$gte) query = query.gte("ts", filter.ts.$gte.toISOString?.() || filter.ts.$gte);
      const { data } = await query;
      return (data || []).map(mapRow);
    } catch { return []; }
  },
};

export { ThreatLog };
export default ThreatLog;
