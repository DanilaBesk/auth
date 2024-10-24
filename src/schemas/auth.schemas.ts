import { z } from 'zod';

import {
  VERIFICATION_CODE,
  AUTHORIZATION_HEADER,
  PASSWORD,
  OAUTH_STRATEGY,
  FIRST_NAME,
  LAST_NAME
} from '#/schemas/common.schemas';

export const RegistrationSchema = z.object({
  body: z
    .object({
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      email: z.string().email(),
      password: PASSWORD,
      code: VERIFICATION_CODE
    })
    .strict(),
  ip: z.string().ip(),
  headers: z.object({
    'user-agent': z.string()
  })
});

export const LoginSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      password: PASSWORD
    })
    .strict(),
  ip: z.string().ip(),
  headers: z.object({
    'user-agent': z.string()
  })
});

export const OAuthSchema = z.object({
  query: z
    .object({
      strategy: OAUTH_STRATEGY
    })
    .strict()
});

export const OAuthCallbackSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  signedCookies: z.object({
    state: z.string()
  }),
  query: z.object({
    strategy: OAUTH_STRATEGY,
    code: z.string(),
    state: z.string()
  })
});

// TODO: Реализация логаута сессий через ссылку в электронном письме

export const RefreshTokensSchema = z.object({
  cookies: z.object({
    refreshToken: z.string()
  }),
  ip: z.string().ip(),
  headers: z.object({
    'user-agent': z.string()
  })
});

export const AuthorizationHeaderSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  })
});
