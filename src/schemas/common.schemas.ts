import { z } from 'zod';

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '#/constants/auth.constants';
import { CODE_LENGTH } from '#/constants/code.constants';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';
import { Role } from '@prisma/client';

export const USER_ID = z
  .string(createValidationOptions('id', 'string'))
  .uuid('Invalid user id');

export const EMAIL = z
  .string(createValidationOptions('email', 'string'))
  .email('Invalid email address');

export const PASSWORD = z
  .string(createValidationOptions('password', 'string'))
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be ${MIN_PASSWORD_LENGTH} or more characters long`
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must be ${MAX_PASSWORD_LENGTH} or fewer characters long`
  );

export const ROLE = z.enum(Object.keys(Role) as [keyof typeof Role], {
  errorMap: (error, ctx) => {
    switch (error.code) {
      case z.ZodIssueCode.invalid_enum_value:
        return { message: 'Invalid role' };
      case z.ZodIssueCode.invalid_type:
        return {
          message: createValidationOptions('role', 'string').invalid_type_error
        };
    }
    return { message: ctx.defaultError };
  }
});

export const VERIFICATION_CODE = z
  .string(createValidationOptions('verification code', 'string'))
  .refine((str) => str.length === CODE_LENGTH, 'Invalid verification code');

export const IP = z
  .string(createValidationOptions('ip', 'string'))
  .ip('Invalid ip');

export const FINGERPRINT = z.string(
  createValidationOptions('fingerprint', 'string')
);

export const USER_AGENT_HEADER = z.string(
  createValidationOptions('user-agent', 'string')
);

export const AUTHORIZATION_HEADER = z
  .string(createValidationOptions('header authorization', 'string'))
  .refine((header) => {
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && !!token;
  }, 'Invalid authorization header. Expected format: Bearer <token>')
  .transform((header) => header.split(' ')[1]);

export const REFRESH_TOKEN = z.string(
  createValidationOptions('refresh token', 'string')
);

export const REFRESH_SESSION_ID = z
  .string(createValidationOptions('refresh session', 'string'))
  .uuid('Invalid refreshSessionId');
