/**
 * GatewayConfig model — Supabase shim (with in-memory singleton fallback)
 * Replaces Mongoose GatewayConfig model with Supabase PostgreSQL operations.
 */
import { getSupabaseClient } from "../config/supabase.js";
import { DEFAULT_HARDENED_SYSTEM_PROMPT } from "../data/prompts.js";

const TABLE = "gateway_config";

// In-memory singleton fallback when Supabase table doesn't exist yet
let _inMemorySingleton = null;

function getDefault() {
  return {
    _id: "singleton",
    id: "singleton",
    systemPrompt: DEFAULT_HARDENED_SYSTEM_PROMPT,
    version: "v1",
    updatedAt: new Date(),
    history: [
      {
        version: "v1",
        systemPrompt: DEFAULT_HARDENED_SYSTEM_PROMPT,
        reason: "Initial baseline hardened security prompt.",
        source: "initial",
        createdAt: new Date(),
      },
    ],
    toJSON() { return this; },
  };
}

const _GatewayConfig = {
  async getSingleton() {
    // Return in-memory if already loaded
    if (_inMemorySingleton) return _inMemorySingleton;

    const sb = getSupabaseClient();
    if (!sb) {
      _inMemorySingleton = getDefault();
      return _inMemorySingleton;
    }

    try {
      const { data, error } = await sb.from(TABLE).select("*").eq("id", "singleton").maybeSingle();
      if (error || !data) {
        _inMemorySingleton = getDefault();
        return _inMemorySingleton;
      }
      _inMemorySingleton = {
        ...data,
        _id: data.id,
        history: data.history || [],
        toJSON() { return this; },
      };
      return _inMemorySingleton;
    } catch {
      _inMemorySingleton = getDefault();
      return _inMemorySingleton;
    }
  },

  async findById(id) {
    if (id === "singleton") return _GatewayConfig.getSingleton();
    return null;
  },

  async findByIdAndUpdate(id, update) {
    const current = await _GatewayConfig.getSingleton();
    if (update.$set) Object.assign(current, update.$set);
    _inMemorySingleton = current;

    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb.from(TABLE).upsert({ id: "singleton", ...current }).select().single();
      } catch { /* silent */ }
    }
    return current;
  },
};

export const GatewayConfig = _GatewayConfig;
export default _GatewayConfig;
