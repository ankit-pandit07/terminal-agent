import express from 'express';
import cors from 'cors';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js"
import morgan from "morgan";
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import helmet from 'helmet';

const app=express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(routes);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);
app.use(notFoundMiddleware);
app.use(errorMiddleware);


export default app;