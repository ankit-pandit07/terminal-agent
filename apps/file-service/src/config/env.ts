import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5001),
  CORS_ORIGIN: z.string().optional(),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10),
    STORAGE_PATH: z
    .string()
    .default("./storage"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB,
  STORAGE_PATH: process.env.STORAGE_PATH,
});