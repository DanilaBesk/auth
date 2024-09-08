/* eslint-disable no-console */
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';

config({ path: '../.env' });

import { ErrorMiddleware } from '#/middlewares/error-middleware';
import { prisma } from '#/providers/prisma.provider';
import { CONFIG } from '#config';
import { RouteNotFoundMiddleware } from './middlewares/route-not-found.middleware';

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

app.all('*', RouteNotFoundMiddleware);

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
