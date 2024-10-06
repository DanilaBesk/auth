import { z } from 'zod';

import {
  AUTHORIZATION_HEADER,
  VERIFICATION_CODE,
  EMAIL,
  IP
} from '#/schemas/common.schemas';

export const RequestActivationCodeSchema = z.object({
  body: z.object({
    email: EMAIL
  }),
  ip: IP
});

export const RequestEmailChangeCodeSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  }),
  body: z.object({
    newEmail: EMAIL
  }),
  ip: IP
});

export const ChangeEmailWithCodeVerificationSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  }),
  body: z.object({
    newEmail: EMAIL,
    code: VERIFICATION_CODE
  })
});

export const RequestUserDeletionCodeSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  }),
  ip: IP
});

export const DeleteUserWithCodeVerificationSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  }),
  body: z.object({
    code: VERIFICATION_CODE
  })
});
