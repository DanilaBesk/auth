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
    origin: `http://${CONFIG.CLIENT_HOST}:${CONFIG.CLIENT_PORT}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: 'Origin, Content-Type, Authorization, Accept',
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
app.use(express.json());
app.use(cookieParser());

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
    console.error('Start server error: ', error);
  }
};

const handleProcessCompletion = async () => {
  try {
    console.log('Closing the connections...');

    await prisma.$disconnect();
    console.log('Prisma disconnected.');

    await redis.quit();
    console.log('Redis connection closed.');
  } catch (error) {
    console.error('Error while closing connections:', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', handleProcessCompletion);
process.on('SIGTERM', handleProcessCompletion);

start();
