/**
 * ThreatLog model — Supabase shim
 * Replaces Mongoose ThreatLog model with Supabase PostgreSQL operations.
 */
import { getSupabaseClient } from "../config/supabase.js";
import { randomUUID } from "crypto";

const TABLE = "threat_logs";

function mapRow(row) {
  if (!row) return null;
  let pii = [];
  let rules = [];
  try {
    pii = typeof row.pii_entities === "string" ? JSON.parse(row.pii_entities) : (row.pii_entities || []);
  } catch { pii = []; }
  try {
    rules = typeof row.matched_rules === "string" ? JSON.parse(row.matched_rules) : (row.matched_rules || []);
  } catch { rules = []; }

  return {
    ...row,
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    clientIp: row.client_ip,
    attackType: row.attack_type,
    owaspId: row.owasp_id,
    payloadRedacted: row.payload_redacted,
    payloadHash: row.payload_hash,
    piiEntities: pii,
    matchedRules: rules,
    llmCalled: row.llm_called,
    incidentId: row.incident_id,
    latencyMs: row.latency_ms,
    createdAt: row.ts,
    toJSON() { return this; },
  };
}

function makeQuery(execFn) {
  let limitVal = null;
  let skipVal = null;

  const queryObj = {
    sort() { return queryObj; },
    limit(n) { limitVal = n; return queryObj; },
    skip(n) { skipVal = n; return queryObj; },
    lean() { return queryObj; },
    async exec() {
      let res = await execFn();
      if (skipVal) res = res.slice(skipVal);
      if (limitVal) res = res.slice(0, limitVal);
      return res;
    },
    then(onFulfilled, onRejected) { return this.exec().then(onFulfilled, onRejected); },
    catch(onRejected) { return this.exec().catch(onRejected); },
    finally(onFinally) { return this.exec().finally(onFinally); },
  };
  return queryObj;
}

function makeSingleQuery(execFn) {
  const queryObj = {
    lean() { return queryObj; },
    exec() { return execFn(); },
    then(onFulfilled, onRejected) { return execFn().then(onFulfilled, onRejected); },
    catch(onRejected) { return execFn().catch(onRejected); },
    finally(onFinally) { return execFn().finally(onFinally); },
  };
  return queryObj;
}

const ThreatLog = {
  async create(data) {
    const sb = getSupabaseClient();
    const newId = randomUUID();
    if (!sb) return mapRow({ id: newId, ts: new Date().toISOString(), ...data });
    try {
      const { data: row, error } = await sb
        .from(TABLE)
        .insert({
          id: newId,
          ts: new Date().toISOString(),
          user_id: data.userId || null,
          session_id: data.sessionId || "default-session",
          client_ip: data.clientIp || "127.0.0.1",
          channel: data.channel || "chat",
          direction: data.direction || "inbound",
          attack_type: data.attackType || "benign",
          owasp_id: data.owaspId || null,
          severity: data.severity || "low",
          score: data.score || 0,
          action: data.action || "allowed",
          payload_redacted: (data.payloadRedacted || "").slice(0, 500),
          payload_hash: data.payloadHash || "",
          pii_entities: JSON.stringify(data.piiEntities || []),
          matched_rules: JSON.stringify(data.matchedRules || []),
          llm_called: Boolean(data.llmCalled),
          incident_id: data.incidentId ? String(data.incidentId) : null,
          latency_ms: data.latencyMs || 0,
          source: data.source || "live",
        })
        .select()
        .single();
      if (error) {
        console.warn("⚠️ ThreatLog insert warning:", error.message);
        return mapRow({ id: newId, ts: new Date().toISOString(), ...data });
      }
      return mapRow(row);
    } catch (err) {
      console.warn("⚠️ ThreatLog create skipped:", err.message);
      return mapRow({ id: newId, ts: new Date().toISOString(), ...data });
    }
  },

  async countDocuments(filter = {}) {
    const sb = getSupabaseClient();
    if (!sb) return 0;
    try {
      let query = sb.from(TABLE).select("id", { count: "exact", head: true });
      if (filter.action) query = query.eq("action", filter.action);
      if (filter.severity) query = query.eq("severity", filter.severity);
      if (filter.attackType) query = query.eq("attack_type", filter.attackType);
      const { count } = await query;
      return count || 0;
    } catch { return 0; }
  },

  find(filter = {}) {
    return makeQuery(async () => {
      const sb = getSupabaseClient();
      if (!sb) return [];
      try {
        let query = sb.from(TABLE).select("*").order("ts", { ascending: false }).limit(500);
        if (filter.ts?.$gte) {
          const val = filter.ts.$gte instanceof Date ? filter.ts.$gte.toISOString() : filter.ts.$gte;
          query = query.gte("ts", val);
        }
        if (filter.ts?.$lt) {
          const val = filter.ts.$lt instanceof Date ? filter.ts.$lt.toISOString() : filter.ts.$lt;
          query = query.lt("ts", val);
        }
        if (filter.action) query = query.eq("action", filter.action);
        if (filter.severity) query = query.eq("severity", filter.severity);
        if (filter.attackType) query = query.eq("attack_type", filter.attackType);
        const { data } = await query;
        return (data || []).map(mapRow);
      } catch { return []; }
    });
  },

  findById(id) {
    return makeSingleQuery(async () => {
      const sb = getSupabaseClient();
      if (!sb) return null;
      try {
        const { data } = await sb.from(TABLE).select("*").eq("id", id).maybeSingle();
        return mapRow(data);
      } catch { return null; }
    });
  },
};

export { ThreatLog };
export default ThreatLog;
