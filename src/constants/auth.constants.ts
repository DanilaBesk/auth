import { CONFIG } from '#config';
import { CookieOptions } from 'express';

export const MAX_SESSIONS_FOR_USER = 5;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 30;

export const BCRYPT_SALT_ROUNDS = 10;

export const ACCESS_TOKEN_EXPIRES_IN = 5 * 60;
export const REFRESH_TOKEN_EXPIRES_IN = 14 * 24 * 60 * 60;

export const OAUTH_ATTEMPT_EXPIRATION_SECONDS = 30 * 60;

export const JWT_SIGNING_ALGORITHM = 'HS512';

export const OAUTH_SIGN_UP_ATTEMPT_REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'email'
] as const;

//TODO: change to true
const isSecure = CONFIG.APP_PROTOCOL === 'https';

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  maxAge: REFRESH_TOKEN_EXPIRES_IN * 1000,
  path: '/api/auth',
  domain: CONFIG.CLIENT_HOST,
  secure: isSecure,
  httpOnly: true,
  sameSite: 'strict'
};

export const OAUTH_STATE_COOKIE_OPTIONS: CookieOptions = {
  maxAge: 5 * 60 * 1000,
  path: '/api/auth',
  domain: 'localhost',
  secure: isSecure,
  httpOnly: true,
  sameSite: 'lax',
  signed: true
};
