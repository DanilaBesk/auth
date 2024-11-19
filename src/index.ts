/* eslint-disable no-console */

import cors from 'cors';
import express, { Application } from 'express';

import { CLIENT_URL, CONFIG } from '#config';
import { prisma, redis } from '#/providers';
import { router } from '#/routes';
import {
  RouteNotFoundMiddleware,
  ErrorMiddleware,
  JsonParseMiddleware,
  CookieParseMiddleware
} from '#/middlewares';

export const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: `${CLIENT_URL}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
app.use(JsonParseMiddleware());
app.use(CookieParseMiddleware(CONFIG.COOKIE_SECRET));

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

const closeConnections = (() => {
  let isClosing = false;
  return async () => {
    if (isClosing) return;
    isClosing = true;

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
})();

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});
process.on('rejectionHandled', (promise) => {
  console.warn('rejectionHandled', promise);
});
process.on('multipleResolves', (type, promise, reason) => {
  console.error('multipleResolves', { type, promise, reason });
});
process.on('uncaughtException', async (error) => {
  console.error('uncaughtException', error);
  await closeConnections();
});

process.on('SIGINT', async () => {
  console.log('SIGINT');
  await closeConnections();
});
process.on('SIGTERM', async () => {
  console.log('SIGTERM');
  await closeConnections();
});

start();
