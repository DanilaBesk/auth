import { z } from 'zod';
import { User } from '@prisma/client';

import {
  AccessTokenPayloadSchema,
  RefreshTokenPayloadSchema
} from '#/schemas/token.schemas';

export type TTokenType = 'access' | 'refresh';

export type TRefreshSession = {
  tokenSignature: string;
  ip: string;
  ua: string;
  fingerprint: string;
  createdAt: number;
};

export type TValidateTokenPayload<T extends z.AnyZodObject> = {
  schema: T;
  payload: unknown;
  tokenType: TTokenType;
};

export type TJwtSign = {
  payload: object;
  secret: string;
  subject: string;
  expiresIn: number;
};

export type TJwtVerify<T extends z.AnyZodObject> = {
  tokenType: TTokenType;
  token: string;
  schema: T;
  secret: string;
};

export type TJwtDecode = {
  token: string;
};

export type TGetRefreshSessionKey = { userId: User['id'] };

type TAccessTokenPayloadSchema = z.infer<typeof AccessTokenPayloadSchema>;

type TRefreshTokenPayloadSchema = z.infer<typeof RefreshTokenPayloadSchema>;

export type TAccessTokenData = Omit<TAccessTokenPayloadSchema, 'sub'> & {
  userId: TAccessTokenPayloadSchema['sub'];
};

export type TRefreshTokenData = Omit<TRefreshTokenPayloadSchema, 'sub'> & {
  userId: TRefreshTokenPayloadSchema['sub'];
};

export type TMakeAccessToken = TAccessTokenData;

export type TMakeRefreshTokenData = Pick<TRefreshTokenData, 'userId'>;

export type TAddRefreshSession = {
  userId: User['id'];
  refreshSessionId: string;
} & Omit<TRefreshSession, 'createdAt'>;

export type TGetRefreshSession = {
  userId: User['id'];
  refreshSessionId: string;
};

export type TGetAllUserRefreshSessions = {
  userId: User['id'];
};

export type TGetUserRefreshSessionsCount = {
  userId: User['id'];
};

export type TDeleteRefreshSession = {
  userId: User['id'];
  refreshSessionId: string;
};

export type TDeleteAllUserRefreshSessions = {
  userId: User['id'];
};

export type TVerifyRefreshToken = {
  refreshToken: string;
};

export type TVerifyAccessToken = {
  accessToken: string;
};
