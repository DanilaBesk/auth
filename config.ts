import { z } from 'zod';

const portSchema = z.preprocess(
  (data) => parseInt(String(data), 10),
  z.number()
);

const configSchema = z.object({
  DATABASE_URL: z.string(),

  COOKIE_SECRET: z.string(),

  JWT_ACCESS_SECRET: z.string(),

  CLIENT_URL: z.string(),

  APP_HOST: z.string(),
  APP_PORT: portSchema,

  REDIS_URI: z.string(),

  SMTP_HOST: z.string(),
  SMTP_PORT: portSchema,
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),

  NODE_ENV: z.enum(['development', 'production', 'test'])
});

export const CONFIG: z.infer<typeof configSchema> = configSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,

  COOKIE_SECRET: process.env.COOKIE_SECRET,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,

  CLIENT_URL: process.env.CLIENT_URL,

  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,

  REDIS_URI: process.env.REDIS_URL,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,

  NODE_ENV: process.env.NODE_ENV
});
