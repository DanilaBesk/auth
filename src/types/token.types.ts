import { z } from 'zod';

import { AccessTokenPayloadSchema } from '#/schemas/token.schemas';
import { Role } from '@prisma/client';

export type TToken = 'access' | 'refresh';

export type TAccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;

export type TJwtSign = {
  payload?: object;
  secret: string;
  subject: string;
  expiresIn: number;
};

export type TValidateTokenPayload<T extends z.AnyZodObject> = {
  payload: unknown;
  schema: T;
  tokenType: TToken;
};

export type TJwtVerify<T extends z.AnyZodObject> = {
  token: string;
  secret: string;
  schema: T;
  tokenType: TToken;
};

export type TDecodeTokenComplete = {
  token: string;
};

export type TDecodeTokenToJson = {
  token: string;
};

export type TMakeAccessToken = {
  userId: string;
  refreshSessionId: string;
  role: Role;
};

export type TMakeRefreshTokenData = {
  userId: string;
};

export type TVerifyRefreshToken = {
  refreshToken: string;
};

export type TVerifyAccessToken = {
  accessToken: string;
};
