import { z } from 'zod';

import { ROLE, USER_ID } from '#/schemas/user.schemas';
import { REFRESH_SESSION_ID } from '#/schemas/auth.schemas';

export const RefreshTokenPayloadSchema = z.object({
  sub: USER_ID,
  refreshSessionId: REFRESH_SESSION_ID
});

export const AccessTokenPayloadSchema = z.object({
  sub: USER_ID,
  refreshSessionId: REFRESH_SESSION_ID,
  role: ROLE
});
