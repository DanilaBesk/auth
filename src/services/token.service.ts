import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { nanoid } from 'nanoid';

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
import {
  AccessTokenPayloadSchema,
  RefreshTokenPayloadSchema
} from '#/schemas/token.schemas';
import {
  TDecodeTokenComplete,
  TDecodeTokenToJson,
  TJwtSign,
  TJwtVerify,
  TMakeAccessToken,
  TMakeRefreshTokenData,
  TValidateTokenPayload,
  TVerifyAccessToken,
  TVerifyRefreshToken
} from '#/types/token.types';

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
        payload ?? {},
        secret,
        { algorithm: JWT_SIGNING_ALGORITHM, subject, expiresIn },
        (error, token) => {
          if (error) {
            return reject(new UnexpectedError(error));
          }
          if (token === undefined) {
            return reject(new UnexpectedError('Token is undefined.'));
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
          return reject(new UnexpectedError('Decoded token is undefined.'));
        }

        try {
          const validatedPayload = await this.validateTokenPayload({
            schema,
            payload: decoded.payload,
            tokenType
          });

          return resolve({
            ...decoded,
            payload: validatedPayload
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  public static decodeTokenComplete({ token }: TDecodeTokenComplete) {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new UnexpectedError('Token has not been decoded.');
    }
    return decoded;
  }

  public static decodeTokenToJson({ token }: TDecodeTokenToJson) {
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new UnexpectedError('Token has not been decoded.');
    }
    if (typeof decoded === 'string') {
      throw new UnexpectedError('Token must not be a string.');
    }
    return decoded;
  }

  static async makeAccessToken({
    userId,
    refreshSessionId,
    role
  }: TMakeAccessToken) {
    const payload = {
      refreshSessionId,
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
    const refreshSessionId = nanoid();

    const payload = {
      refreshSessionId
    };

    const refreshToken = await this.jwtSign({
      payload,
      secret: CONFIG.JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      subject: userId
    });
    const tokenSignature = this.decodeTokenComplete({
      token: refreshToken
    }).signature;

    return { refreshSessionId, refreshToken, tokenSignature };
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
