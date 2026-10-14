/**
 * AuditReport model — Supabase shim
 * Replaces Mongoose AuditReport model with Supabase PostgreSQL operations.
 * Falls back to in-memory store if table doesn't exist yet.
 */
import { getSupabaseClient } from "../config/supabase.js";
import { randomUUID } from "crypto";

const TABLE = "audit_reports";

// In-memory fallback store
const _memStore = [];

function mapRow(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    id: row.id,
    categories: typeof row.categories === "string" ? JSON.parse(row.categories) : (row.categories || []),
    vectors: typeof row.vectors === "string" ? JSON.parse(row.vectors) : (row.vectors || []),
    recommendations: typeof row.recommendations === "string" ? JSON.parse(row.recommendations) : (row.recommendations || []),
    toJSON() { return this; },
  };
}

const AuditReport = {
  async create(data) {
    const newId = randomUUID();
    const record = { _id: newId, id: newId, ...data, createdAt: new Date() };

    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data: row, error } = await sb
          .from(TABLE)
          .insert({
            id: newId,
            user_id: data.userId || null,
            target_prompt_redacted: data.targetPromptRedacted || "",
            template_id: data.templateId || null,
            grade: data.grade,
            score: data.score,
            categories: JSON.stringify(data.categories || []),
            vectors: JSON.stringify(data.vectors || []),
            recommendations: JSON.stringify(data.recommendations || []),
            model: data.model || "gemini-2.0-flash-lite",
            duration_ms: data.durationMs || 0,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (!error && row) return mapRow(row);
      } catch { /* fall through to in-memory */ }
    }

    _memStore.unshift(record);
    if (_memStore.length > 50) _memStore.pop();
    return record;
  },

  find() {
    return {
      sort() { return this; },
      limit(n) { return this._exec(n); },
      lean() { return this; },
      _n: 10,
      async _exec(n) {
        const sb = getSupabaseClient();
        if (sb) {
          try {
            const { data } = await sb
              .from(TABLE)
              .select("*")
              .order("created_at", { ascending: false })
              .limit(n || 10);
            if (data) return data.map(mapRow);
          } catch { /* fall through */ }
        }
        return _memStore.slice(0, n || 10);
      },
    };
  },
};

export { AuditReport };
export default AuditReport;
