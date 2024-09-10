import {
  MAX_PASSWORD_SYMBOLS,
  MIN_PASSWORD_SYMBOLS
} from '#/constants/auth.constants';
import { ACTIVATION_CODE } from '#/schemas/auth-codes.schemas';
import { REFRESH_TOKEN } from '#/schemas/token.schemas';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';
import { z } from 'zod';

export const EMAIL = z
  .string(createValidationOptions('email', 'string'))
  .email('Invalid email address');

export const PASSWORD = z
  .string(createValidationOptions('password', 'string'))
  .min(
    MIN_PASSWORD_SYMBOLS,
    `Password must be ${MIN_PASSWORD_SYMBOLS} or more characters long`
  )
  .max(
    MAX_PASSWORD_SYMBOLS,
    `Password must be ${MAX_PASSWORD_SYMBOLS} or fewer characters long`
  );

export const USER_AGENT = z.string(
  createValidationOptions('user-agent', 'string')
);

export const FINGERPRINT = z.string(
  createValidationOptions('fingerprint', 'string')
);
export const IP = z
  .string(createValidationOptions('ip', 'string'))
  .ip('Invalid ip');

export const USER_ID = z
  .string(createValidationOptions('user id', 'string'))
  .uuid('Invalid user id');

export const ROLE = z.enum(
  ['USER', 'ADMIN'],
  createValidationOptions('role', 'string')
);

export const RegistrationSchema = z.object({
  body: z.object({
    email: EMAIL,
    password: PASSWORD,
    code: ACTIVATION_CODE,
    fingerprint: FINGERPRINT
  }),
  ip: IP,
  headers: z.object({
    'user-agent': USER_AGENT
  })
});

export const LoginSchema = z.object({
  body: z.object({
    email: EMAIL,
    password: PASSWORD,
    fingerprint: FINGERPRINT
  }),
  ip: IP,
  headers: z.object({
    'user-agent': USER_AGENT
  })
});

export const LogoutSchema = z.object({
  signedCookies: z.object({
    refreshToken: REFRESH_TOKEN
  })
});
