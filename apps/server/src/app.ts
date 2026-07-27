import express from 'express';
import cors from 'cors';

import routes from "./routes/index.js"

import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';

const app=express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware)


export default app;