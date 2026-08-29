import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SERVER_URL: z.string().default("http://localhost:5000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5001),
  CORS_ORIGIN: z.string().optional(),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10),
    STORAGE_PATH: z
    .string()
    .default("./storage"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SERVER_URL: process.env.AUTH_SERVER_URL,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB,
  STORAGE_PATH: process.env.STORAGE_PATH,
});