import { CookieOptions } from 'express';
import { CONFIG } from '#config';

export const MAX_REFRESH_TOKENS_FOR_USER = 5;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 30;

export const BCRYPT_SALT_ROUNDS = 10;

export const ACCESS_TOKEN_EXPIRES_IN = 5 * 60;
export const REFRESH_TOKEN_EXPIRES_IN = 14 * 24 * 60 * 60;

export const JWT_SIGNING_ALGORITHM = 'HS512';

export const REFRESH_SESSION_CANCELLATION_TIMEOUT_HOURS = 24;

export const REFRESH_COOKIE_OPIONS: CookieOptions = {
  maxAge: REFRESH_TOKEN_EXPIRES_IN * 1000,
  path: '/api/auth',
  domain: CONFIG.CLIENT_HOST,
  secure: false, //TODO: change to true
  httpOnly: true,
  sameSite: 'strict'
};
