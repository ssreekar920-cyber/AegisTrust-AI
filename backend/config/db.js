/**
 * Database connection — Supabase only.
 * MongoDB has been removed; all persistence is handled via Supabase PostgreSQL.
 */

export async function connectDB() {
  // No-op: Supabase is initialized via config/supabase.js
  console.log("ℹ️ DB_PROVIDER=supabase — MongoDB is not used.");
}

export async function disconnectDB() {
  // No-op: Supabase client handles its own lifecycle
}

export default connectDB;
