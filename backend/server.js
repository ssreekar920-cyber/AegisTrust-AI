import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import GatewayConfig from "./models/gatewayConfig.model.js";
import logger from "./utils/logger.js";

import bcrypt from "bcryptjs";
import User from "./models/user.model.js";

import { isSupabaseConfigured, testSupabaseConnection } from "./config/supabase.js";

const server = http.createServer(app);

async function startServer() {
  try {
    // 1. Connect database (MongoDB primary/fallback)
    await connectDB();

    // 1b. Check Supabase connection if configured
    if (isSupabaseConfigured()) {
      const sbStatus = await testSupabaseConnection();
      if (sbStatus.connected) {
        console.log(`⚡ Supabase PostgreSQL connected! (${sbStatus.message})`);
      } else {
        console.warn(`⚠️ Supabase connection status: ${sbStatus.error || sbStatus.message}`);
      }
    } else {
      console.log(`ℹ️ Supabase not configured in backend/.env — ready for SUPABASE_URL & SUPABASE_KEY.`);
    }

    // 2. Auto-seed demo user if needed
    if (env.SEED_DEMO_USER) {
      try {
        const existingUser = await User.findOne({ email: "demo@aegistrust.demo" });
        if (!existingUser) {
          const salt = await bcrypt.genSalt(12);
          const passwordHash = await bcrypt.hash("DemoPass123", salt);
          await User.create({
            name: "Alex Vance (SecOps)",
            email: "demo@aegistrust.demo",
            passwordHash,
            role: "admin",
          });
          console.log("✅ Demo user auto-seeded: demo@aegistrust.demo");
        }
      } catch (seedErr) {
        console.warn("⚠️ Demo user auto-seeding skipped:", seedErr.message);
      }
    }

    // 3. Initialize gateway system prompt singleton
    let configVersion = "v1";
    try {
      const config = await GatewayConfig.getSingleton();
      configVersion = config.version;
      console.log(`🛡️ gateway system prompt ${configVersion} loaded`);
    } catch (cfgErr) {
      console.warn("⚠️ Gateway system prompt fallback to v1:", cfgErr.message);
    }

    // 4. Start listening on PORT
    server.listen(env.PORT, () => {
      console.log(`🚀 listening on ${env.PORT}`);
      logger.info("server_started", {
        port: env.PORT,
        gatewayVersion: configVersion,
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
      console.log("🔒 Database disconnected. Server closed cleanly.");
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
