import { z } from 'zod';

import { FINGERPRINT, IP, USER_AGENT, USER_ID } from '#/schemas/user.schemas';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';

export const ACCESS_TOKEN = z.string(
  createValidationOptions('access token', 'string')
);

export const REFRESH_TOKEN = z
  .string(createValidationOptions('refresh token', 'string'))
  .uuid('Invalid refresh token');

export const RefreshTokensSchema = z.object({
  signedCookies: z.object({
    refreshToken: REFRESH_TOKEN
  }),
  body: z.object({
    fingerprint: FINGERPRINT,
    userId: USER_ID
  }),
  ip: IP,
  headers: z.object({
    'user-agent': USER_AGENT
  })
});
