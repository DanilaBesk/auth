import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { CONFIG } from '#config';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  JWT_SIGNING_ALGORITHM,
  REFRESH_TOKEN_EXPIRES_IN
} from '#/constants/auth.constants';
import {
  InvalidTokenPayloadError,
  TokenExpiredError,
  TokenVerifyError,
  UnexpectedError
} from '#/errors/classes.errors';
import { redis } from '#/providers';
import {
  TAddRefreshSession,
  TDeleteAllUserRefreshSessions,
  TDeleteRefreshSession,
  TGetAllUserRefreshSessions,
  TGetRefreshSession,
  TGetRefreshSessionKey,
  TGetUserRefreshSessionsCount,
  TJwtDecode,
  TJwtSign,
  TJwtVerify,
  TMakeAccessToken,
  TMakeRefreshTokenData,
  TRefreshSession,
  TValidateTokenPayload,
  TVerifyAccessToken,
  TVerifyRefreshToken
} from '#/types/token.types';
import {
  AccessTokenPayloadSchema,
  RefreshTokenPayloadSchema
} from '#/schemas/token.schemas';

export class TokenService {
  private static async validateTokenPayload<T extends z.AnyZodObject>({
    schema,
    payload,
    tokenType
  }: TValidateTokenPayload<T>): Promise<z.infer<T>> {
    const result = await schema.safeParseAsync(payload);

    if (!result.success) {
      throw new InvalidTokenPayloadError({ tokenType });
    }

    return result.data;
  }

  private static jwtSign({
    payload,
    secret,
    expiresIn,
    subject
  }: TJwtSign): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        secret,
        { algorithm: JWT_SIGNING_ALGORITHM, subject, expiresIn },
        (error, token) => {
          if (error) {
            return reject(new UnexpectedError(error));
          }
          if (token === undefined) {
            return reject(
              new UnexpectedError({
                message: 'Token is undefined'
              })
            );
          }
          return resolve(token);
        }
      );
    });
  }

  private static jwtVerify<T extends z.AnyZodObject>({
    tokenType,
    token,
    schema,
    secret
  }: TJwtVerify<T>): Promise<{
    header: jwt.JwtHeader;
    payload: z.infer<T>;
    signature: string;
  }> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, { complete: true }, async (error, decoded) => {
        if (error) {
          if (error instanceof jwt.JsonWebTokenError) {
            if (error instanceof jwt.TokenExpiredError) {
              return reject(
                new TokenExpiredError({ tokenType, expiredAt: error.expiredAt })
              );
            }
            return reject(new TokenVerifyError({ tokenType }));
          }
          return reject(new UnexpectedError(error));
        }
        if (!decoded) {
          return reject(
            new UnexpectedError({
              message: 'Decoded token is undefined'
            })
          );
        }
        const validatedPayload = await this.validateTokenPayload({
          schema,
          payload: decoded.payload,
          tokenType
        });

        return resolve({
          ...decoded,
          payload: validatedPayload
        });
      });
    });
  }

  private static jwtDecode({ token }: TJwtDecode) {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new UnexpectedError({ message: 'Token has not been decoded' });
    }
    return decoded;
  }

  private static getRefreshSesionsKey({ userId }: TGetRefreshSessionKey) {
    return `refresh:${userId}`;
  }

  private static generateRefreshSessionId() {
    return uuid();
  }

  static async makeAccessToken({
    userId,
    refreshSessionId,
    email,
    role
  }: TMakeAccessToken) {
    const payload = {
      refreshSessionId,
      email,
      role
    };

    return await this.jwtSign({
      payload,
      secret: CONFIG.JWT_ACCESS_SECRET,
      subject: userId,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
  }

  static async makeRefreshTokenData({ userId }: TMakeRefreshTokenData) {
    const refreshSessionId = this.generateRefreshSessionId();

    const payload = {
      refreshSessionId
    };

    const refreshToken = await this.jwtSign({
      payload,
      secret: CONFIG.JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      subject: userId
    });
    const tokenSignature = this.jwtDecode({ token: refreshToken }).signature;

    return { refreshSessionId, refreshToken, tokenSignature };
  }

  static async addRefreshSession({
    userId,
    refreshSessionId,
    tokenSignature,
    ua,
    ip,
    fingerprint
  }: TAddRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    const refreshRecord: TRefreshSession = {
      tokenSignature,
      ip,
      ua,
      fingerprint,
      createdAt: Date.now()
    };

    await redis.hSet(
      refreshSessionsKey,
      refreshSessionId,
      JSON.stringify(refreshRecord)
    );
    redis.hExpire(
      refreshSessionsKey,
      refreshSessionId,
      REFRESH_TOKEN_EXPIRES_IN
    );
    // установка ttl для всего ключа, ведь время жизни всего ключа такое же, как и у последней добавленной сессии
    redis.expire(refreshSessionsKey, REFRESH_TOKEN_EXPIRES_IN);
  }

  static async getRefreshSession({
    userId,
    refreshSessionId
  }: TGetRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    const record = await redis.hGet(refreshSessionsKey, refreshSessionId);

    if (record !== undefined) {
      return JSON.parse(record) as TRefreshSession;
    }
    return record;
  }

  static async getAllUserRefreshSessions({
    userId
  }: TGetAllUserRefreshSessions) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    const refreshSessionsStr = await redis.hGetAll(refreshSessionsKey);

    const refreshSessions = Object.entries(refreshSessionsStr).reduce<
      Record<string, TRefreshSession>
    >((acc, [key, value]) => {
      acc[key] = JSON.parse(value) as TRefreshSession;
      return acc;
    }, {});

    return refreshSessions;
  }

  static async getUserRefreshSessionsCount({
    userId
  }: TGetUserRefreshSessionsCount) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    return await redis.hLen(refreshSessionsKey);
  }

  static async deleteRefreshSession({
    userId,
    refreshSessionId
  }: TDeleteRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    await redis.hDel(refreshSessionsKey, refreshSessionId);
  }

  static async deleteAllUserRefreshSessions({
    userId
  }: TDeleteAllUserRefreshSessions) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    await redis.del(refreshSessionsKey);
  }

  static async verifyRefreshToken({ refreshToken }: TVerifyRefreshToken) {
    return await this.jwtVerify({
      token: refreshToken,
      secret: CONFIG.JWT_REFRESH_SECRET,
      schema: RefreshTokenPayloadSchema,
      tokenType: 'refresh'
    });
  }
  static async verifyAccessToken({ accessToken }: TVerifyAccessToken) {
    return await this.jwtVerify({
      token: accessToken,
      secret: CONFIG.JWT_ACCESS_SECRET,
      schema: AccessTokenPayloadSchema,
      tokenType: 'access'
    });
  }
}
