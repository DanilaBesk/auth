import { prisma } from 'prisma';
import { CONFIG } from '#config';
import { v4 as uuid } from 'uuid';
import * as jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  MAX_REFRESH_TOKENS_FOR_USER,
  REFRESH_TOKEN_EXPIRES_IN
} from '#/constants/auth.constants';
import {
  TDeleteRefreshToken,
  TMakeAccessToken,
  TRemoveRefreshToken,
  TSaveRefreshToken
} from '#/types/token.types';
import { redis } from '#/providers/redis.provider';
import {
  AccessTokenExpiredError,
  AccessTokenInvalidError,
  MaxSessionsExceededError,
  UserIdNotFoundError
} from '#/errors/api-error';

export class TokenService {
  static makeAccessToken({ email, id, role }: TMakeAccessToken) {
    const payload = {
      email,
      role
    };
    const options: jwt.SignOptions = {
      algorithm: 'HS512',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      subject: id
    };

    return jwt.sign(payload, CONFIG.JWT_ACCESS_SECRET, options);
  }
  static makeRefreshUUID() {
    return uuid();
  }
  static async saveRefreshToken({
    refreshUUID,
    userId,
    ua,
    fingerprint
  }: TSaveRefreshToken) {
    const user = prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UserIdNotFoundError();
    }
    const refreshSessionsKey = `refresh:${userId}`;

    const refreshRecord = {
      ua,
      fingerprint,
      expiresAt: Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000
    };

    const countRefreshTokens = await redis.hlen(refreshSessionsKey);

    if (countRefreshTokens >= MAX_REFRESH_TOKENS_FOR_USER) {
      throw new MaxSessionsExceededError();
    }
    await redis.hset(
      refreshSessionsKey,
      refreshUUID,
      JSON.stringify(refreshRecord)
    );
  }
  static async removeRefreshToken({
    refreshUUID,
    userId,
    fingerprint
  }: TRemoveRefreshToken) {}
  static validateAccessToken(token: string) {
    let userData;
    try {
      userData = jwt.verify(token, CONFIG.JWT_ACCESS_SECRET);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new AccessTokenExpiredError({ expiredAt: error.expiredAt });
        }
        throw new AccessTokenInvalidError();
      }
      throw error;
    }

    return userData;
  }
}
