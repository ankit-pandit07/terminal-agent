//src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  DATABASE_URL: process.env.DATABASE_URL || "",
  OLLAMA_URL: process.env.OLLAMA_URL ?? "http://localhost:11434",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",

  // Twilio Verify credentials
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "nodebase-default-session-secret",
  FILE_SERVICE_URL: process.env.FILE_SERVICE_URL || "http://localhost:5001",
};