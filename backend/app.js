import express from "express";
import cors from "cors";
import morgan from "morgan";
import env from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import securityRoutes from "./routes/security.routes.js";
import { getHealth } from "./controllers/security.controller.js";
import { securityRateLimiter } from "./middleware/rateLimit.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

// 1. JSON body parser with 1mb limit
app.use(express.json({ limit: "1mb" }));

// 2. CORS configured strictly per spec
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: false,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Request logger (never logs bodies)
app.use(morgan("tiny"));

import { testSupabaseConnection, isSupabaseConfigured } from "./config/supabase.js";

// 4. Public Health Check endpoint (no auth)
app.get("/api/health", getHealth);

// 4b. Supabase Database Status endpoint (no auth)
app.get("/api/supabase/status", async (req, res) => {
  const configured = isSupabaseConfigured();
  const status = await testSupabaseConnection();
  res.json({ configured, ...status });
});

// 5. Auth routes
app.use("/api/auth", authRoutes);

// 6. Security routes (with rate limiter)
app.use("/api/security", securityRateLimiter, securityRoutes);

// 7. 404 handler
app.use(notFoundHandler);

// 8. Central error handling middleware
app.use(errorHandler);

export default app;
