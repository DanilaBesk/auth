import express, { Application } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { ErrorMiddleware } from '@/middlewares/error-middleware';
import { db } from '@/lib/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

export const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    preflightContinue: false
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(ErrorMiddleware);

const start = async () => {
  try {
    await db.$connect();
    app.listen(PORT, () => {
      console.info(`Server start on PORT ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};
start();
