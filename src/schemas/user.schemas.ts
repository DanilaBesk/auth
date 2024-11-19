import { z } from 'zod';

import {
  VERIFICATION_CODE,
  PASSWORD,
  FIRST_NAME,
  LAST_NAME
} from '#/schemas/common.schemas';

export const UpdateUserInfoSchema = z.object({
  body: z
    .object({
      firstName: FIRST_NAME,
      lastName: LAST_NAME
    })
    .strict()
});

export const RequestEmailChangeCodeSchema = z.object({
  body: z
    .object({
      newEmail: z.string().email()
    })
    .strict(),
  ip: z.string().ip()
});

export const RequestUserDeletionCodeSchema = z.object({
  ip: z.string().ip()
});

export const DeleteUserSchema = z.object({
  body: z
    .object({
      code: VERIFICATION_CODE
    })
    .strict()
});

export const ChangeEmailSchema = z.object({
  body: z
    .object({
      newEmail: z.string().email(),
      code: VERIFICATION_CODE
    })
    .strict()
});

export const ChangePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: PASSWORD,
      newPassword: PASSWORD,
      signOutOtherSessions: z.boolean()
    })
    .strict()
});

export const SetPasswordSchema = z.object({
  body: z
    .object({
      newPassword: PASSWORD,
      signOutOtherSessions: z.boolean()
    })
    .strict()
});
