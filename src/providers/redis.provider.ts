import { Redis } from 'ioredis';
import { CONFIG } from '#config';

export const redis = new Redis(CONFIG.REDIS_URI);
