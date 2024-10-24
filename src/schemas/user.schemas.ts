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

export const RequestActivationCodeSchema = z.object({
  body: z
    .object({
      email: z.string().email()
    })
    .strict(),
  ip: z.string().ip()
});

export const RequestEmailChangeCodeSchema = z.object({
  body: z
    .object({
      newEmail: z.string().email()
    })
    .strict(),
  ip: z.string().ip()
});

export const ChangeEmailWithCodeVerificationSchema = z.object({
  body: z
    .object({
      newEmail: z.string().email(),
      code: VERIFICATION_CODE
    })
    .strict()
});

export const RequestUserDeletionCodeSchema = z.object({
  ip: z.string().ip()
});

export const DeleteUserWithCodeVerificationSchema = z.object({
  body: z
    .object({
      code: VERIFICATION_CODE
    })
    .strict()
});

export const RequestPasswordResetCodeSchema = z.object({
  body: z
    .object({
      email: z.string().email()
    })
    .strict(),
  ip: z.string().ip()
});

export const ResetPasswordWithCodeVerificationSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      code: VERIFICATION_CODE,
      newPassword: PASSWORD
    })
    .strict()
});

export const ChangePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: PASSWORD,
      newPassword: PASSWORD,
      logoutOtherSessions: z.boolean()
    })
    .strict()
});

export const SetPasswordSchema = z.object({
  body: z
    .object({
      newPassword: PASSWORD,
      logoutOtherSessions: z.boolean()
    })
    .strict()
});
