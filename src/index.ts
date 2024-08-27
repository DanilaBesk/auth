import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { ErrorMiddleware } from '#/middlewares/error-middleware';
import { prisma } from '#/lib/prisma';
import { CONFIG } from '#config';

export const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: CONFIG.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(ErrorMiddleware);

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(CONFIG.PORT, () => {
      console.info(`Server start on PORT ${CONFIG.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};
start();
