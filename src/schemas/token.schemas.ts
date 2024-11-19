import { z } from 'zod';

import {
  ROLE,
  TIMESTAMP_ANY,
  TIMESTAMP_UNTIL_NOW
} from '#/schemas/common.schemas';

export const RefreshTokenPayloadSchema = z
  .object({
    sub: z.string().uuid(),
    sessionId: z.string(),
    iat: TIMESTAMP_UNTIL_NOW,
    exp: TIMESTAMP_ANY
  })
  .strict();

export const AccessTokenPayloadSchema = z
  .object({
    sub: z.string().uuid(),
    sessionId: z.string(),
    role: ROLE,
    iat: TIMESTAMP_UNTIL_NOW,
    exp: TIMESTAMP_ANY
  })
  .strict();
