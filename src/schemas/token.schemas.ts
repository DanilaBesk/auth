import { z } from 'zod';

import { REFRESH_SESSION_ID, ROLE, USER_ID } from '#/schemas/common.schemas';

export const RefreshTokenPayloadSchema = z.object({
  sub: USER_ID,
  refreshSessionId: REFRESH_SESSION_ID
});

export const AccessTokenPayloadSchema = z.object({
  sub: USER_ID,
  refreshSessionId: REFRESH_SESSION_ID,
  role: ROLE
});
