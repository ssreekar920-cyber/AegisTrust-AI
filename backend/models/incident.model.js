/**
 * Incident model — Supabase shim
 * Replaces Mongoose Incident model with Supabase PostgreSQL operations.
 */
import { getSupabaseClient } from "../config/supabase.js";
import { randomUUID } from "crypto";

const TABLE = "incidents";

function mapRow(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    id: row.id,
    threatVector: row.threat_vector,
    payloadRedacted: row.payload_redacted,
    patchSystemPrompt: row.patch_system_prompt,
    patchRationale: row.patch_rationale,
    patchAppliedAt: row.patch_applied_at,
    patchVersion: row.patch_version,
    createdAt: row.created_at,
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

const Incident = {
  async create(data) {
    const sb = getSupabaseClient();
    const newId = randomUUID();
    if (!sb) return mapRow({ id: newId, ...data });
    try {
      const { data: row, error } = await sb
        .from(TABLE)
        .insert({
          id: newId,
          source: data.source || "chat",
          payload_redacted: data.payloadRedacted || "",
          threat_vector: data.threatVector || "unknown",
          confidence: data.confidence || 90,
          status: data.status || "open",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) {
        console.warn("⚠️ Incident insert warning:", error.message);
        return mapRow({ id: newId, ...data });
      }
      return mapRow(row);
    } catch (err) {
      console.warn("⚠️ Incident create skipped:", err.message);
      return mapRow({ id: newId, ...data });
    }
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

  findOne(filter = {}) {
    return makeSingleQuery(async () => {
      const sb = getSupabaseClient();
      if (!sb) return null;
      try {
        let query = sb.from(TABLE).select("*").limit(1);
        if (filter.id) query = query.eq("id", filter.id);
        if (filter._id) query = query.eq("id", filter._id);
        if (filter.status) query = query.eq("status", filter.status);
        const { data } = await query.maybeSingle();
        return mapRow(data);
      } catch { return null; }
    });
  },

  find(filter = {}) {
    return makeQuery(async () => {
      const sb = getSupabaseClient();
      if (!sb) return [];
      try {
        let query = sb.from(TABLE).select("*").order("created_at", { ascending: false }).limit(100);
        if (filter.status) query = query.eq("status", filter.status);
        const { data } = await query;
        return (data || []).map(mapRow);
      } catch { return []; }
    });
  },

  async findByIdAndUpdate(id, update) {
    const sb = getSupabaseClient();
    if (!sb) return null;
    try {
      const patch = {};
      if (update.$set) {
        const s = update.$set;
        if (s.status) patch.status = s.status;
        if (s["patch.systemPrompt"]) patch.patch_system_prompt = s["patch.systemPrompt"];
        if (s["patch.rationale"]) patch.patch_rationale = JSON.stringify(s["patch.rationale"]);
        if (s["patch.appliedAt"]) patch.patch_applied_at = s["patch.appliedAt"];
        if (s["patch.version"]) patch.patch_version = s["patch.version"];
      }
      const { data } = await sb.from(TABLE).update(patch).eq("id", id).select().single();
      return mapRow(data);
    } catch { return null; }
  },

  async countDocuments(filter = {}) {
    const sb = getSupabaseClient();
    if (!sb) return 0;
    try {
      let query = sb.from(TABLE).select("id", { count: "exact", head: true });
      if (filter.status) query = query.eq("status", filter.status);
      const { count } = await query;
      return count || 0;
    } catch { return 0; }
  },
};

export { Incident };
export default Incident;
