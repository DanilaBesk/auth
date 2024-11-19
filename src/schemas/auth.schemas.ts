import { z } from 'zod';

import {
  AUTHORIZATION_HEADER,
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  OAUTH_PROVIDER_NAME,
  PASSWORD,
  VERIFICATION_CODE
} from '#/schemas/common.schemas';

export const SignUpSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  body: z
    .object({
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      email: EMAIL,
      password: PASSWORD,
      code: VERIFICATION_CODE
    })
    .strict()
});

export const SignInSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  body: z
    .object({
      email: EMAIL,
      password: PASSWORD
    })
    .strict()
});

export const RequestAuthCodeSchema = z.object({
  ip: z.string().ip(),
  body: z
    .object({
      email: EMAIL
    })
    .strict()
});

export const RequestOAuthSignInAttemptCodeSchema = z.object({
  ip: z.string().ip(),
  params: z.object({
    attemptId: z.string()
  })
});

export const RequestOAuthSignUpAttemptCodeSchema = z.object({
  ip: z.string().ip(),
  params: z.object({
    attemptId: z.string()
  }),
  body: z.object({
    email: z.optional(EMAIL)
  })
});

export const SignInByCodeSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  body: z
    .object({
      email: EMAIL,
      code: VERIFICATION_CODE
    })
    .strict()
});

export const ResetPasswordSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  body: z
    .object({
      email: EMAIL,
      newPassword: PASSWORD,
      code: VERIFICATION_CODE
    })
    .strict()
});

export const OAuthCallbackSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  body: z
    .object({
      code: z.string(),
      codeVerifier: z.string(),
      providerName: OAUTH_PROVIDER_NAME
    })
    .strict()
});

export const OAuthSignUpAttemptSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  params: z.object({
    attemptId: z.string()
  }),
  body: z
    .object({
      email: z.optional(EMAIL),
      firstName: z.optional(FIRST_NAME),
      lastName: z.optional(LAST_NAME),
      code: z.optional(VERIFICATION_CODE)
    })
    .strict()
});

export const OAuthSignInAttemptSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  params: z.object({
    attemptId: z.string()
  }),
  body: z
    .object({
      code: VERIFICATION_CODE
    })
    .strict()
});

export const SignOutSessionSchema = z.object({
  params: z.object({
    sessionId: z.string()
  })
});

// TODO: Реализация логаута сессий через ссылку в электронном письме

export const RefreshTokensSchema = z.object({
  headers: z.object({
    'user-agent': z.string()
  }),
  ip: z.string().ip(),
  cookies: z.object({
    refreshToken: z.string()
  })
});

export const AuthorizationHeaderSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  })
});
