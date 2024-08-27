import { z } from 'zod';

const configSchema = z.object({
  PORT: z.preprocess((data) => parseInt(String(data), 10), z.number()),
  DATABASE_URL: z.string(),
  CLIENT_URL: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string()
});

export const CONFIG: z.infer<typeof configSchema> = configSchema.parse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
});
