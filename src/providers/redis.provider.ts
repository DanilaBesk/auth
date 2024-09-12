/* eslint-disable no-console */
import { createClient } from 'redis';
import { CONFIG } from '#config';

export const redis = await createClient({ url: CONFIG.REDIS_URI })
  .on('error', (err) => console.log('Redis Client Error', err))
  .connect();
