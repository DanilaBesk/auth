import { z } from 'zod';
import { config } from 'dotenv';

config();

const portSchema = z.preprocess(
  (data) => parseInt(String(data), 10),
  z.number().min(0).max(65535)
);

const protocolSchema = z.union([z.literal('http'), z.literal('https')]);

export const CONFIG = z
  .object({
    DATABASE_URL: z.string().url(),

    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),

    CLIENT_PROTOCOL: protocolSchema,
    CLIENT_HOST: z.string(),
    CLIENT_PORT: portSchema,

    APP_PROTOCOL: protocolSchema,
    APP_HOST: z.string(),
    APP_PORT: portSchema,

    REDIS_URL: z.string().url(),

    SMTP_HOST: z.string(),
    SMTP_PORT: portSchema,
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),

    GOOGLE_OAUTH_CLIENT_ID: z.string(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
    GOOGLE_OAUTH_REDIRECT_PATH: z.string(),

    GITHUB_OAUTH_CLIENT_ID: z.string(),
    GITHUB_OAUTH_CLIENT_SECRET: z.string(),
    GITHUB_OAUTH_REDIRECT_PATH: z.string(),

    YANDEX_OAUTH_CLIENT_ID: z.string(),
    YANDEX_OAUTH_CLIENT_SECRET: z.string(),
    YANDEX_OAUTH_REDIRECT_PATH: z.string(),

    IP_DATA_KEY: z.string(),

    COOKIE_SECRET: z.string(),

    NODE_ENV: z.enum(['development', 'production', 'test'])
  })
  .parse(process.env);

export const CLIENT_URL = `${CONFIG.CLIENT_PROTOCOL}://${CONFIG.CLIENT_HOST}:${CONFIG.CLIENT_PORT}`;

export const APP_URL = `${CONFIG.APP_PROTOCOL}://${CONFIG.APP_HOST}:${CONFIG.APP_PORT}`;
