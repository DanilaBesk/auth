import { z } from 'zod';

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '#/constants/auth.constants';
import { CODE_LENGTH } from '#/constants/code.constants';
import {
  MAX_EMAIL_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH
} from '#/constants/user.constants';
import { OAuthProviderName, Role } from '@prisma/client';

export const FIRST_NAME = z.string().min(1).max(MAX_FIRST_NAME_LENGTH);

export const LAST_NAME = z.string().min(1).max(MAX_LAST_NAME_LENGTH);

export const PASSWORD = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .max(MAX_PASSWORD_LENGTH);

export const EMAIL = z.string().email().max(MAX_EMAIL_LENGTH);

export const ROLE = z.enum(Object.keys(Role) as [keyof typeof Role]);

export const OAUTH_PROVIDER_NAME = z.enum(
  Object.keys(OAuthProviderName) as [keyof typeof OAuthProviderName]
);

export const VERIFICATION_CODE = z.string().length(CODE_LENGTH);

export const TIMESTAMP_UNTIL_NOW = z.number().int().min(0).max(Date.now());
export const TIMESTAMP_ANY = z.number().int().min(0);

export const AUTHORIZATION_HEADER = z
  .string()
  .refine((header) => {
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && !!token;
  }, 'Invalid authorization header. Expected format: Bearer <token>')
  .transform((header) => header.split(' ')[1]);
