import { FINGERPRINT, IP, USER_AGENT } from '#/schemas/user.schemas';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';
import { z } from 'zod';

export const ACCESS_TOKEN = z.string(
  createValidationOptions('access token', 'string')
);

export const REFRESH_TOKEN = z
  .string(createValidationOptions('refresh token', 'string'))
  .uuid('Invalid refresh token');

export const RefreshTokensSchema = z.object({
  cookie: z.object({
    refreshToken: REFRESH_TOKEN
  }),
  body: z.object({
    fingerprint: FINGERPRINT
  }),
  ip: IP,
  headers: z.object({
    'user-agent': USER_AGENT
  })
});
