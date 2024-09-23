/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
import { createClient } from 'redis';
import { CONFIG } from '#config';

declare global {
  var redis: ReturnType<typeof createClient> | undefined;
}

const redis =
  global.redis ||
  createClient({
    url: CONFIG.REDIS_URL,
    socket: { tls: true }
  }).on('error', (err) => console.log('Redis Client Error', err));

if (process.env.NODE_ENV !== 'production') {
  global.redis = redis;
}

export { redis };
