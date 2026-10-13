import { createClient } from "@supabase/supabase-js";
import env from "./env.js";

let supabaseClient = null;

export function isSupabaseConfigured() {
  return Boolean(
    env.SUPABASE_URL &&
    env.SUPABASE_KEY &&
    env.SUPABASE_URL.startsWith("http") &&
    !env.SUPABASE_URL.includes("your-project-id")
  );
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`⚡ Supabase client initialized for ${env.SUPABASE_URL}`);
    } catch (err) {
      console.error("❌ Failed to initialize Supabase client:", err.message);
      return null;
    }
  }

  return supabaseClient;
}

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: "Supabase credentials not configured in backend/.env",
    };
  }

  try {
    // Attempt a light query to verify auth & network connectivity
    const { data, error } = await client.from("users").select("count", { count: "exact", head: true });
    if (error && error.code !== "PGRST116") {
      // If table doesn't exist yet, we still know auth and network passed
      if (error.code === "42P01" || error.message.includes("relation") || error.message.includes("does not exist")) {
        return {
          connected: true,
          tablesCreated: false,
          message: "Connected to Supabase! (Tables need to be created via supabase_schema.sql)",
        };
      }
      return {
        connected: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      connected: true,
      tablesCreated: true,
      message: "Successfully connected to Supabase database!",
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
}

export const supabase = getSupabaseClient();
export default getSupabaseClient;
