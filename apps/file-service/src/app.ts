import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(errorMiddleware);

app.use(
  cors({
    origin: env.CORS_ORIGIN || true,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/health", healthRouter);

export default app;