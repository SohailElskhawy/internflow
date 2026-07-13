import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function validateEnv() {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    // Return empty schema defaults or dummy values during static compilation/build
    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      JWT_SECRET: process.env.JWT_SECRET || "dummy-secret-key-for-build",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "dummy-gemini-key-for-build",
      RESEND_API_KEY: process.env.RESEND_API_KEY || "dummy-resend-key-for-build",
      NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
    };
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = validateEnv();
