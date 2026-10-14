
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
    toJSON() { return this; },
  };
}

const Incident = {
  async create(data) {
    const sb = getSupabaseClient();
    const newId = randomUUID();
    if (!sb) return { _id: newId, id: newId, ...data };
    try {
      const { data: row, error } = await sb
        .from(TABLE)
        .insert({
          id: newId,
          source: data.source,
          payload_redacted: data.payloadRedacted || "",
          threat_vector: data.threatVector,
          confidence: data.confidence || 90,
          status: data.status || "open",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) {
        console.warn("⚠️ Incident insert warning:", error.message);
        return { _id: newId, id: newId, ...data };
      }
      return mapRow(row);
    } catch (err) {
      console.warn("⚠️ Incident create skipped:", err.message);
      return { _id: newId, id: newId, ...data };
    }
  },

  async findById(id) {
    const sb = getSupabaseClient();
    if (!sb) return null;
    try {
      const { data } = await sb.from(TABLE).select("*").eq("id", id).maybeSingle();
      return mapRow(data);
    } catch { return null; }
  },

  async find(filter = {}) {
    const sb = getSupabaseClient();
    if (!sb) return [];
    try {
      let query = sb.from(TABLE).select("*").order("created_at", { ascending: false }).limit(100);
      if (filter.status) query = query.eq("status", filter.status);
      const { data } = await query;
      return (data || []).map(mapRow);
    } catch { return []; }
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
