import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";
import morgan from "morgan";
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import helmet from 'helmet';
import { env } from './config/env.js';

const app = express();

// Enable trust proxy for Render / reverse proxies to correctly handle X-Forwarded-Proto and rate limiting
app.set("trust proxy", 1);

// Rate limiter for authentication endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 auth requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in a few minutes.",
  },
});

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

const configuredOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter((s) => Boolean(s) && s !== "*")
  : [];

const allowedOrigins: string[] = Array.from(
  new Set([...defaultAllowedOrigins, ...configuredOrigins])
);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, "");

    if (
      allowedOrigins.includes(cleanOrigin) ||
      env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "Accept",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Apply auth rate limiting
app.use("/auth", authLimiter);

app.use(routes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;