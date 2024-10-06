import { z } from 'zod';

import {
  VERIFICATION_CODE,
  AUTHORIZATION_HEADER,
  EMAIL,
  FINGERPRINT,
  IP,
  PASSWORD,
  REFRESH_TOKEN,
  USER_AGENT_HEADER
} from '#/schemas/common.schemas';

export const RegistrationSchema = z.object({
  body: z.object({
    email: EMAIL,
    password: PASSWORD,
    code: VERIFICATION_CODE,
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
    authorization: AUTHORIZATION_HEADER
  })
});

export const LogoutAllSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  })
});

export const LogoutAllExceptCurrentSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
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
