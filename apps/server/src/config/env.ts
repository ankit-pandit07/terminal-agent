//src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT )|| 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',   

    //Future use
    DATABASE_URL: process.env.DATABASE_URL || "",
    OLLAMA_API_KEY: process.env.OLLAMA_API_KEY || "",
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
};