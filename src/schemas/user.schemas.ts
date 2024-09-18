import { z } from 'zod';
import { Role } from '@prisma/client';

import {
  ACTIVATION_CODE_LENGTH,
  CHANGE_EMAIL_CODE_LENGTH,
  CHANGE_PASSWORD_CODE_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '#/constants/auth.constants';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';

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

export const ACTIVATION_CODE = z
  .string(createValidationOptions('activation code', 'string'))
  .refine(
    (str) => str.length === ACTIVATION_CODE_LENGTH,
    'Invalid activation code'
  );
export const CHANGE_EMAIL_CODE = z
  .string(createValidationOptions('change email code', 'string'))
  .refine(
    (str) => str.length === CHANGE_EMAIL_CODE_LENGTH,
    'Invalid change email code'
  );
export const CHANGE_PASSWORD_CODE = z
  .string(createValidationOptions('change password code', 'string'))
  .refine(
    (str) => str.length === CHANGE_PASSWORD_CODE_LENGTH,
    'Invalid change password code'
  );

export const IP = z
  .string(createValidationOptions('ip', 'string'))
  .ip('Invalid ip');

export const FINGERPRINT = z.string(
  createValidationOptions('fingerprint', 'string')
);

export const USER_AGENT_HEADER = z.string(
  createValidationOptions('user-agent', 'string')
);

export const AUTHORIZATION_HEADER_ACCESS_TOKEN = z
  .string(createValidationOptions('header authorization', 'string'))
  .refine((header) => {
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && !!token;
  }, 'Invalid authorization header. Expected format: Bearer <token>');

export const CreateActivationRecordSchema = z.object({
  body: z.object({
    email: EMAIL
  }),
  ip: IP
});
