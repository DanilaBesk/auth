import { z } from 'zod';

import {
  ACTIVATION_CODE,
  AUTHORIZATION_HEADER_ACCESS_TOKEN,
  EMAIL,
  FINGERPRINT,
  IP,
  PASSWORD,
  USER_AGENT_HEADER
} from '#/schemas/user.schemas';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';

export const REFRESH_TOKEN = z.string(
  createValidationOptions('refresh token', 'string')
);

export const REFRESH_SESSION_ID = z
  .string(createValidationOptions('refresh session', 'string'))
  .uuid('Invalid refreshSessionId');

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
  headers: z.object({
    authorization: AUTHORIZATION_HEADER_ACCESS_TOKEN
  })
});

export const LogoutAllSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER_ACCESS_TOKEN
  })
});

export const LogoutAllExceptCurrentSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER_ACCESS_TOKEN
  })
});

export const RefreshTokensSchema = z.object({
  cookies: z.object({
    refreshToken: REFRESH_TOKEN
  }),
  ip: IP,
  headers: z.object({
    'user-agent': USER_AGENT_HEADER
  }),
  body: z.object({
    fingerprint: FINGERPRINT
  })
});
