import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import { isSupabaseConfigured, testSupabaseConnection } from "./config/supabase.js";

const server = http.createServer(app);

async function startServer() {
  try {
    // 1. Initialize DB (no-op for Supabase)
    await connectDB();

    // 2. Verify Supabase connection
    if (isSupabaseConfigured()) {
      const sbStatus = await testSupabaseConnection();
      if (sbStatus.connected) {
        console.log(`⚡ Supabase PostgreSQL connected! (${sbStatus.message})`);
      } else {
        console.warn(`⚠️ Supabase connection status: ${sbStatus.error || sbStatus.message}`);
      }
    } else {
      console.warn("⚠️ Supabase not configured — set SUPABASE_URL & SUPABASE_KEY in .env");
    }

    // 3. Start listening on PORT
    server.listen(env.PORT, () => {
      console.log(`🚀 AegisTrust backend listening on port ${env.PORT}`);
      logger.info("server_started", {
        port: env.PORT,
        dbProvider: env.DB_PROVIDER,
        model: env.GEMINI_MODEL,
      });
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectDB();
      console.log("🔒 Server closed cleanly.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err.message);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();
