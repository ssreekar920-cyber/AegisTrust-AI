/**
 * User model — Supabase shim
 * Replaces Mongoose User model with Supabase PostgreSQL operations.
 */
import { getSupabaseClient } from "../config/supabase.js";
import { randomUUID } from "crypto";

const TABLE = "users";

function mapRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role || "analyst",
    createdAt: row.created_at,
    toJSON() { return this; },
  };
}

const User = {
  async findOne({ email }) {
    const sb = getSupabaseClient();
    if (!sb) return null;
    const { data } = await sb.from(TABLE).select("*").eq("email", email).maybeSingle();
    return mapRow(data);
  },

  async findById(id) {
    const sb = getSupabaseClient();
    if (!sb) return null;
    const { data } = await sb.from(TABLE).select("*").eq("id", id).maybeSingle();
    return mapRow(data);
  },

  async create({ name, email, passwordHash, role = "analyst" }) {
    const sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from(TABLE)
      .insert({ id: randomUUID(), name, email, password_hash: passwordHash, role })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data);
  },
};

export default User;
export { User };
