import { z } from 'zod';

import {
  AccessTokenPayloadSchema,
  RefreshTokenPayloadSchema
} from '#/schemas/token.schemas';

export type TTokenType = 'access' | 'refresh';

type TAccessTokenPayloadSchema = z.infer<typeof AccessTokenPayloadSchema>;

type TRefreshTokenPayloadSchema = z.infer<typeof RefreshTokenPayloadSchema>;

export type TAccessTokenData = Omit<TAccessTokenPayloadSchema, 'sub'> & {
  userId: TAccessTokenPayloadSchema['sub'];
};

export type TRefreshTokenData = Omit<TRefreshTokenPayloadSchema, 'sub'> & {
  userId: TRefreshTokenPayloadSchema['sub'];
};

export type TRefreshSession = {
  tokenSignature: string;
  ip: string;
  ua: string;
  fingerprint: string;
  createdAt: number;
};

export type TJwtSign = {
  payload: object;
  secret: string;
  subject: string;
  expiresIn: number;
};

export type TValidateTokenPayload<T extends z.AnyZodObject> = {
  payload: unknown;
  schema: T;
  tokenType: TTokenType;
};

export type TJwtVerify<T extends z.AnyZodObject> = {
  token: string;
  secret: string;
  schema: T;
  tokenType: TTokenType;
};

export type TJwtDecode = {
  token: string;
};

export type TGetRefreshSessionKey = {
  userId: string;
};

export type TMakeAccessToken = TAccessTokenData;

export type TMakeRefreshTokenData = {
  userId: string;
};

export type TAddRefreshSession = {
  userId: string;
  refreshSessionId: string;
  tokenSignature: string;
  ip: string;
  ua: string;
  fingerprint: string;
};

export type TGetRefreshSession = {
  userId: string;
  refreshSessionId: string;
};

export type TGetAllUserRefreshSessions = {
  userId: string;
};

export type TGetUserRefreshSessionsCount = {
  userId: string;
};

export type TDeleteRefreshSession = {
  userId: string;
  refreshSessionId: string;
};

export type TDeleteAllUserRefreshSessions = {
  userId: string;
};

export type TVerifyRefreshToken = {
  refreshToken: string;
};

export type TVerifyAccessToken = {
  accessToken: string;
};
