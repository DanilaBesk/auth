import * as jwt from 'jsonwebtoken';
import { CONFIG } from '#config';
import { v4 as uuid } from 'uuid';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  MAX_REFRESH_TOKENS_FOR_USER,
  REFRESH_TOKEN_EXPIRES_IN
} from '#/constants/auth.constants';
import {
  TAccessPayload,
  TAddRefreshSession,
  TGetRefreshSession,
  TMakeAccessToken,
  TRefreshSession,
  TRemoveRefreshSession,
  TUserId,
  TVerifyRefreshSession
} from '#/types/token.types';
import { redis } from '#/providers/redis.provider';
import {
  AccessTokenExpiredError,
  AccessTokenVerifyError,
  MaxRefreshSessionsExceededError,
  RefreshSessionInvalidError,
  RefreshSessionNotFoundOrExpiredError
} from '#/errors/api-error';

export class TokenService {
  private static jwtVerify(
    token: string,
    SECRET: jwt.Secret
  ): Promise<jwt.JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, SECRET, (error, decoded) => {
        if (error) {
          if (error instanceof jwt.JsonWebTokenError) {
            if (error instanceof jwt.TokenExpiredError) {
              reject(
                new AccessTokenExpiredError({ expiredAt: error.expiredAt })
              );
            }
            reject(new AccessTokenVerifyError());
          }
          reject(error);
        }
        if (typeof decoded === 'string') {
          return reject(
            new Error('Type of decoded token is string, expected: JwtPayload')
          );
        }
        if (decoded === undefined) {
          return reject(new Error('Decoded token is undefined'));
        }
        return resolve(decoded);
      });
    });
  }

  private static jwtSign(
    payload: jwt.JwtPayload,
    SECRET: jwt.Secret,
    options: jwt.SignOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, SECRET, options, (error, token) => {
        if (error) {
          return reject(error);
        }
        if (token === undefined) {
          return reject(new Error('Token is undefined'));
        }
        return resolve(token);
      });
    });
  }

  private static getRefreshSesionsKey(userId: TUserId) {
    return `refresh:${userId}`;
  }

  static async makeAccessToken({ email, id, role }: TMakeAccessToken) {
    const payload = {
      email,
      role
    };
    const options: jwt.SignOptions = {
      algorithm: 'HS512',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      subject: id
    };

    return await this.jwtSign(payload, CONFIG.JWT_ACCESS_SECRET, options);
  }

  static makeRefreshUUID() {
    return uuid();
  }

  static async getRefreshSession({ refreshUUID, userId }: TGetRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey(userId);

    const record = await redis.hget(refreshSessionsKey, refreshUUID);

    if (record !== null) {
      return JSON.parse(record) as TRefreshSession;
    }
    return record;
  }

  static verifyRefreshSession({
    oldRefreshSession,
    newFingerprint
  }: TVerifyRefreshSession) {
    const now = Date.now();

    if (now >= oldRefreshSession.expiresAt) {
      throw new RefreshSessionNotFoundOrExpiredError();
    }
    if (oldRefreshSession.fingerprint !== newFingerprint) {
      throw new RefreshSessionInvalidError();
    }
  }

  static async addRefreshSession({
    refreshUUID,
    userId,
    ua,
    ip,
    fingerprint
  }: TAddRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey(userId);

    const refreshSessionsStr = await redis.hgetall(refreshSessionsKey);

    // Так как в ioredis нет функции HEXPIRE, то в каждом запросе на добавление необходимо удалять истекшие сессии
    // Для того, чтобы знать сколько активных сессий у пользователя
    const now = Date.now();
    const promises: Promise<any>[] = [];
    let countRefreshSessions = 0;

    for (const key in refreshSessionsStr) {
      if (
        now >=
        (JSON.parse(refreshSessionsStr[key]) as TRefreshSession).expiresAt
      ) {
        promises.push(redis.del(refreshSessionsKey, key));
      } else countRefreshSessions++;
    }
    await Promise.allSettled(promises);

    if (countRefreshSessions >= MAX_REFRESH_TOKENS_FOR_USER) {
      throw new MaxRefreshSessionsExceededError();
    }

    const refreshRecord = {
      ip,
      ua,
      fingerprint,
      expiresAt: Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000
    };

    await redis.hset(
      refreshSessionsKey,
      refreshUUID,
      JSON.stringify(refreshRecord)
    );
    // установка ttl для всего ключа, ведь время жизни всего ключа такое же, как и у последней добавленной сессии
    redis.expire(refreshSessionsKey, REFRESH_TOKEN_EXPIRES_IN);
  }
  static async removeRefreshSession({
    refreshUUID,
    userId
  }: TRemoveRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey(userId);

    await redis.hdel(refreshSessionsKey, refreshUUID);
  }

  static async verifyAccessToken(token: string) {
    const userData = (await this.jwtVerify(
      token,
      CONFIG.JWT_ACCESS_SECRET
    )) as TAccessPayload;

    return userData;
  }
}
