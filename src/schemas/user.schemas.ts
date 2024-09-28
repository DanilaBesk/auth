import { z } from 'zod';

import { AUTHORIZATION_HEADER, EMAIL, IP } from '#/schemas/common.schemas';

export const RequestActivationCodeSchema = z.object({
  body: z.object({
    email: EMAIL
  }),
  ip: IP
});

export const DeleteUserSchema = z.object({
  headers: z.object({
    authorization: AUTHORIZATION_HEADER
  })
});
