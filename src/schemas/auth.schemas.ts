import { z } from 'zod';

import { ACTIVATION_CODE, EMAIL, PASSWORD } from '#/schemas/user.schemas';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';

export const AUTHORIZATION_HEADER_ACCESS_TOKEN = z
  .string(createValidationOptions('header authorization', 'string'))
  .refine((header) => {
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && !!token;
  }, 'Invalid authorization header. Expected format: Bearer <token>');

export const USER_AGENT_HEADER = z.string(
  createValidationOptions('user-agent', 'string')
);

export const REFRESH_TOKEN = z
  .string(createValidationOptions('refresh token', 'string'))
  .uuid('Invalid refresh token');

export const FINGERPRINT = z.string(
  createValidationOptions('fingerprint', 'string')
);

export const IP = z
  .string(createValidationOptions('ip', 'string'))
  .ip('Invalid ip');

export const RegistrationSchema = z.object({
  body: z.object({
    email: EMAIL,
    password: PASSWORD,
    code: ACTIVATION_CODE,
    fingerprint: FINGERPRINT
  }),
  ip: IP,
  headers: z.object({
    'user-agent': USER_AGENT_HEADER
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
    'user-agent': USER_AGENT_HEADER
  })
});

// TODO: Реализация логаута сессий через ссылку в электронном письме

export const LogoutSchema = z.object({
  signedCookies: z.object({
    refreshToken: REFRESH_TOKEN
  }),
  headers: z.object({
    authorization: AUTHORIZATION_HEADER_ACCESS_TOKEN
  })
});

export const LogoutAllSessionsSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER_ACCESS_TOKEN
  })
});

export const LogoutAllSessionsExceptCurrentSchema = z.object({
  signedCookies: z.object({
    refreshToken: REFRESH_TOKEN
  }),
  headers: z.object({
    authorization: AUTHORIZATION_HEADER_ACCESS_TOKEN
  })
});

export const RefreshTokensSchema = z.object({
  signedCookies: z.object({
    refreshToken: REFRESH_TOKEN
  }),
  ip: IP,
  headers: z.object({
    'user-agent': USER_AGENT_HEADER,
    authorization: AUTHORIZATION_HEADER_ACCESS_TOKEN
  }),
  body: z.object({
    fingerprint: FINGERPRINT
  })
});
