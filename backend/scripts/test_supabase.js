import dotenv from "dotenv";
dotenv.config();

import { testSupabaseConnection, isSupabaseConfigured } from "../config/supabase.js";
import env from "../config/env.js";

async function main() {
  console.log("==================================================");
  console.log("🛡️ AegisTrust AI — Supabase Database Connectivity Test");
  console.log("==================================================\n");

  console.log("Configured Environment:");
  console.log(`- SUPABASE_URL: ${env.SUPABASE_URL || "(Not provided in backend/.env)"}`);
  console.log(`- SUPABASE_KEY: ${env.SUPABASE_KEY ? "●●●●●●●● [Set]" : "(Not provided in backend/.env)"}\n`);

  if (!isSupabaseConfigured()) {
    console.log("❌ Supabase is not configured yet.");
    console.log("👉 Add the following to your backend/.env file:\n");
    console.log("SUPABASE_URL=https://your-project-id.supabase.co");
    console.log("SUPABASE_KEY=your-supabase-anon-or-service-role-key\n");
    console.log("Then execute the SQL script in backend/data/supabase_schema.sql in your Supabase SQL Editor.");
    process.exit(1);
  }

  console.log("⏳ Testing connection to Supabase...");
  const result = await testSupabaseConnection();

  if (result.connected) {
    console.log(`✅ Success! ${result.message}`);
    if (result.tablesCreated === false) {
      console.log("\n⚠️ Notice: The connection succeeded, but tables were not found.");
      console.log("👉 Please run 'backend/data/supabase_schema.sql' in your Supabase dashboard SQL Editor to create the tables.");
    }
    process.exit(0);
  } else {
    console.error(`❌ Connection failed: ${result.error || result.message}`);
    if (result.code) console.error(`Error code: ${result.code}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
