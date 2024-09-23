/* eslint-disable no-console */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';

import { CONFIG } from '#config';
import { prisma, redis } from '#/providers';
import { router } from '#/routes';
import { RouteNotFoundMiddleware, ErrorMiddleware } from '#/middlewares';

export const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: CONFIG.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: 'Content-Type, Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
app.use(express.json());
app.use(cookieParser(CONFIG.COOKIE_SECRET));

app.use('/api', router);

app.all('*', RouteNotFoundMiddleware);

app.use(ErrorMiddleware);

const start = async () => {
  try {
    await prisma.$connect();
    await redis.connect();
    app.listen(CONFIG.APP_PORT, CONFIG.APP_HOST, () => {
      console.info(
        `Server start on:
        HOST: ${CONFIG.APP_HOST}
        PORT: ${CONFIG.APP_PORT}`
      );
    });
  } catch (error) {
    console.error(error);
  }
};

const handleProcessCompletion = async () => {
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', handleProcessCompletion);
process.on('SIGTERM', handleProcessCompletion);

start();
