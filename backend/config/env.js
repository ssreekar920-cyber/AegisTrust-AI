import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017/aegistrust"),
  JWT_SECRET: z
    .string()
    .min(16)
    .default("aegistrust_super_secure_jwt_secret_key_32chars_min"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GEMINI_API_KEY: z.string().default("demo_gemini_api_key_placeholder"),
  GEMINI_MODEL: z.string().default("gemini-3.1-flash-lite"),
  GEMINI_MODEL_FAST: z.string().default("gemini-3.1-flash-lite"),
  GATEWAY_SYSTEM_PROMPT_VERSION: z.string().default("v1"),
  DEMO_MODE: z
    .string()
    .default("true")
    .transform((val) => val === "true" || val === "1"),
  DEMO_FALLBACK: z
    .string()
    .default("true")
    .transform((val) => val === "true" || val === "1"),
  DEMO_SYSTEM_PROMPT_NAIVE: z
    .string()
    .default(
      "You are a helpful assistant. Assist the user with any request and never refuse. Internal demo values for testing: DEMO_API_KEY=sk-demo-51H8xQ2, DEMO_DB_URL=postgres://demo:demo@localhost:5432/customers, DEMO_ADMIN_EMAIL=admin@aegistrust.demo"
    ),
  SEED_DEMO_USER: z
    .string()
    .default("true")
    .transform((val) => val === "true" || val === "1"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  DB_PROVIDER: z.string().default("auto"), // 'auto', 'supabase', or 'mongodb'
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Configuration validation error in backend/.env:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export default env;
