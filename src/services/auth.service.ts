import * as bcrypt from 'bcrypt';

import { TokenService, UserService } from '#/services';
import { INITIAL_USER_ROLE } from '#/constants/user.constants';
import {
  BCRYPT_SALT_ROUNDS,
  MAX_REFRESH_TOKENS_FOR_USER,
  REFRESH_SESSION_CANCELLATION_TIMEOUT_HOURS
} from '#/constants/auth.constants';
import {
  InvalidPasswordError,
  MaxRefreshSessionsExceededError,
  RefreshSessionCancellationTimeoutNotReachedError,
  RefreshSessionInvalidFingerprintError,
  RefreshSessionInvalidSignatureError,
  RefreshSessionNotFoundOrExpiredError,
  UnexpectedError,
  UserEmailConflictError,
  UserEmailNotFoundError,
  UserIdNotFoundError
} from '#/errors/classes.errors';
import {
  TCheckPassword,
  TLogin,
  TLogout,
  TLogoutAll,
  TLogoutAllExceptCurrent,
  TMakeHashPassword,
  TRefreshTokens,
  TRegistration
} from '#/types/auth.types';
import { TAccessTokenData } from '#/types/token.types';

export class AuthService {
  static checkPassword({
    password,
    passwordHash
  }: TCheckPassword): Promise<void> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, passwordHash, (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new InvalidPasswordError());
        }
        return resolve();
      });
    });
  }

  static makeHashPassword({ password }: TMakeHashPassword): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (error, encrypted) => {
        if (error) {
          reject(new UnexpectedError(error));
        }
        resolve(encrypted);
      });
    });
  }

  static async registration({
    email,
    password,
    code,
    fingerprint,
    ip,
    ua
  }: TRegistration) {
    const candidate = await UserService.findUserByEmail({ email });

    if (candidate) {
      throw new UserEmailConflictError();
    }

    await UserService.verifyActivationCode({ email, code });

    const hashPassword = await this.makeHashPassword({ password });
    const user = await UserService.createUser({
      email,
      password: hashPassword,
      role: INITIAL_USER_ROLE
    });

    const { refreshSessionId, refreshToken, tokenSignature } =
      await TokenService.makeRefreshTokenData({
        userId: user.id
      });

    await TokenService.addRefreshSession({
      userId: user.id,
      refreshSessionId,
      tokenSignature,
      fingerprint,
      ip,
      ua
    });

    const accessTokenData: TAccessTokenData = {
      userId: user.id,
      refreshSessionId,
      role: user.role
    };
    const accessToken = await TokenService.makeAccessToken(accessTokenData);

    return {
      accessToken,
      refreshToken
    };
  }

  static async login({ email, fingerprint, password, ua, ip }: TLogin) {
    const user = await UserService.findUserByEmail({ email });

    if (!user) {
      throw new UserEmailNotFoundError();
    }

    await this.checkPassword({ password, passwordHash: user.password });

    const sessionsCount = await TokenService.getUserRefreshSessionsCount({
      userId: user.id
    });

    if (sessionsCount >= MAX_REFRESH_TOKENS_FOR_USER) {
      throw new MaxRefreshSessionsExceededError();
    }

    const { refreshSessionId, refreshToken, tokenSignature } =
      await TokenService.makeRefreshTokenData({
        userId: user.id
      });

    await TokenService.addRefreshSession({
      userId: user.id,
      refreshSessionId,
      tokenSignature,
      fingerprint,
      ip,
      ua
    });

    const accessTokenData: TAccessTokenData = {
      userId: user.id,
      refreshSessionId,
      role: user.role
    };
    const accessToken = await TokenService.makeAccessToken(accessTokenData);

    return {
      accessToken,
      refreshToken
    };
  }

  static async logout({ userId, refreshSessionId }: TLogout) {
    await TokenService.deleteRefreshSession({ userId, refreshSessionId });
  }

  static async logoutAll({ userId, refreshSessionId }: TLogoutAll) {
    const currentSession = await TokenService.getRefreshSession({
      userId,
      refreshSessionId
    });

    if (!currentSession) {
      throw new RefreshSessionNotFoundOrExpiredError();
    }

    const cancellationTimeout =
      REFRESH_SESSION_CANCELLATION_TIMEOUT_HOURS * 60 * 60 * 1000;
    const timeSinceCreation = Date.now() - currentSession.createdAt;

    if (cancellationTimeout > timeSinceCreation) {
      throw new RefreshSessionCancellationTimeoutNotReachedError({
        createdAt: new Date(currentSession.createdAt)
      });
    }

    await TokenService.deleteAllUserRefreshSessions({ userId });
  }

  static async logoutAllExceptCurrent({
    userId,
    refreshSessionId
  }: TLogoutAllExceptCurrent) {
    const refreshSessions = await TokenService.getAllUserRefreshSessions({
      userId
    });

    const currentSession = refreshSessions[refreshSessionId];

    if (!currentSession) {
      throw new RefreshSessionNotFoundOrExpiredError();
    }

    const cancellationTimeout =
      REFRESH_SESSION_CANCELLATION_TIMEOUT_HOURS * 60 * 60 * 1000;
    const timeSinceCreation = Date.now() - currentSession.createdAt;

    if (cancellationTimeout > timeSinceCreation) {
      throw new RefreshSessionCancellationTimeoutNotReachedError({
        createdAt: new Date(currentSession.createdAt)
      });
    }

    const sessionsToDelete = Object.entries(refreshSessions).reduce<
      Promise<void>[]
    >((acc, [key]) => {
      if (key !== refreshSessionId) {
        acc.push(
          TokenService.deleteRefreshSession({ userId, refreshSessionId: key })
        );
      }
      return acc;
    }, []);

    await Promise.all(sessionsToDelete);
  }

  static async refreshTokens({
    userId,
    refreshSessionId,
    tokenSignature,
    ip,
    ua,
    fingerprint
  }: TRefreshTokens) {
    const [user, oldRefreshSession] = await Promise.all([
      UserService.findUserById({ userId }),
      TokenService.getRefreshSession({
        userId,
        refreshSessionId
      })
    ]);
    if (oldRefreshSession) {
      await TokenService.deleteRefreshSession({ userId, refreshSessionId });
    }

    if (!user) {
      throw new UserIdNotFoundError();
    }

    if (!oldRefreshSession) {
      throw new RefreshSessionNotFoundOrExpiredError();
    }
    if (oldRefreshSession.tokenSignature !== tokenSignature) {
      throw new RefreshSessionInvalidSignatureError();
    }
    if (oldRefreshSession.fingerprint !== fingerprint) {
      throw new RefreshSessionInvalidFingerprintError();
    }

    const sessionsCount = await TokenService.getUserRefreshSessionsCount({
      userId: user.id
    });

    if (sessionsCount >= MAX_REFRESH_TOKENS_FOR_USER) {
      throw new MaxRefreshSessionsExceededError();
    }

    const {
      refreshSessionId: newRefreshSessionId,
      refreshToken: newRefreshToken,
      tokenSignature: newTokenSignature
    } = await TokenService.makeRefreshTokenData({ userId });

    await TokenService.addRefreshSession({
      userId,
      refreshSessionId: newRefreshSessionId,
      tokenSignature: newTokenSignature,
      ua,
      ip,
      fingerprint
    });

    const tokenData: TAccessTokenData = {
      userId: user.id,
      refreshSessionId: newRefreshSessionId,
      role: user.role
    };
    const accessToken = await TokenService.makeAccessToken(tokenData);

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }
}
