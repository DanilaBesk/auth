import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

import {
  BCRYPT_SALT_ROUNDS,
  OAUTH_ATTEMPT_EXPIRATION_SECONDS,
  OAUTH_SIGN_UP_ATTEMPT_REQUIRED_FIELDS
} from '#/constants/auth.constants';
import { INITIAL_USER_ROLE } from '#/constants/user.constants';
import {
  CurrentSessionNotFoundOrExpiredError,
  CurrentSessionSignatureMismatchError,
  CurrentUserNotFoundError,
  EmailAlreadyTakenError,
  EmailAlreadyVerifiedError,
  EmailNotFoundError,
  IncorrectPasswordError,
  InvalidCredentialsError,
  OAuthAttemptError,
  OAuthSignInAttemptNotFoundOrExpiredError,
  OAuthSignUpAttemptNotFoundOrExpiredError,
  PasswordNotSetError,
  SessionNotFoundError,
  TOAuthSignUpAttemptRequiredDataError
} from '#/errors/classes.errors';
import { UnexpectedError } from '#/errors/common-classes.errors';
import { ipdata, prisma, redis } from '#/providers';
import {
  AvatarService,
  CodeService,
  MailService,
  OAuthService,
  SessionService,
  TokenService,
  UserService
} from '#/services';
import {
  TAuthData,
  TCheckPassword,
  TCreateAuthData,
  TGetCodeKey,
  TGetOAuthAttemptKey,
  TMakeHashPassword,
  TOAuthCallback,
  TOAuthCallbackDataReturned,
  TOAuthSignInAttempt,
  TOAuthSignInAttemptRecord,
  TOAuthSignUpAttempt,
  TOAuthSignUpAttemptFieldsData,
  TOAuthSignUpAttemptRecord,
  TRefreshTokens,
  TRequestAuthCode,
  TRequestOAuthSignInAttemptCode,
  TRequestOAuthSignUpAttemptCode,
  TResetPassword,
  TSignIn,
  TSignOutAll,
  TSignOutAllExceptCurrent,
  TSignOutSession,
  TSignUp,
  TVerifySignInCode
} from '#/types/auth.types';

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
          return reject(new IncorrectPasswordError());
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

  private static async createAuthData({
    user,
    providers,
    ip,
    ua
  }: TCreateAuthData): Promise<TAuthData> {
    const { sessionId, refreshToken, tokenSignature } =
      await TokenService.makeRefreshTokenData({
        userId: user.id
      });

    const { sessions } = await SessionService.createSession({
      userId: user.id,
      sessionId,
      tokenSignature,
      ip,
      ua
    });

    const accessToken = await TokenService.makeAccessToken({
      userId: user.id,
      sessionId,
      role: user.role
    });

    const sessionsInfo = await SessionService.getUserSessionsInfo({
      sessions
    });

    const userData = UserService.getUserDataReturned({
      user,
      providers,
      sessionsInfo
    });

    return {
      user: userData,
      accessToken,
      refreshToken
    };
  }

  private static getSignUpCodeKey({ email }: TGetCodeKey) {
    return `sign-up:${email}`;
  }
  private static getSignInCodeKey({ email }: TGetCodeKey) {
    return `sign-in:${email}`;
  }
  private static getPasswordResetCodeKey({ email }: TGetCodeKey) {
    return `reset-password:${email}`;
  }
  private static getOAuthSignInCodeKey({ email }: TGetCodeKey) {
    return `oauth-sign-in:${email}`;
  }
  private static getOAuthSignUpCodeKey({ email }: TGetCodeKey) {
    return `oauth-sign-up:${email}`;
  }
  private static getOAuthSignInAttemptKey({ attemptId }: TGetOAuthAttemptKey) {
    return `oauth-sign-in-attempt:${attemptId}`;
  }
  private static getOAuthSignUpAttemptKey({ attemptId }: TGetOAuthAttemptKey) {
    return `oauth-sign-up-attempt:${attemptId}`;
  }

  static async signUp({
    firstName,
    lastName,
    email,
    password,
    code,
    ip,
    ua
  }: TSignUp) {
    const emailExist = await UserService.findUserByEmail({
      email
    });

    if (emailExist) {
      throw new EmailAlreadyTakenError();
    }

    const codeKey = this.getSignUpCodeKey({ email });

    await CodeService.verifyCode({ idKey: codeKey, code });

    const hashPassword = await this.makeHashPassword({ password });

    const { avatarFilename, avatarBackgroundFilename } =
      AvatarService.generateAvatarFilenames();

    await AvatarService.createDefaultAvatarBackground({
      avatarBackgroundFilename
    });
    await AvatarService.createDefaultAvatar({
      avatarFilename,
      avatarBackgroundFilename,
      firstName,
      lastName
    });

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashPassword,
        role: INITIAL_USER_ROLE,
        hasImage: false,
        avatarFilename,
        avatarBackgroundFilename
      }
    });

    return this.createAuthData({ user, providers: [], ip, ua });
  }

  static async requestSignUpCode({ email, ip, requestTime }: TRequestAuthCode) {
    const emailExist = await UserService.findUserByEmail({ email });

    if (emailExist) {
      throw new EmailAlreadyTakenError();
    }

    const codeKey = this.getSignUpCodeKey({ email });

    const { code } = await CodeService.createCode({
      idKey: codeKey
    });

    const requestIpData = await ipdata.getIPData(ip);

    await MailService.sendUserActivationCode({
      code,
      email,
      requestIp: ip,
      requestIpData,
      requestTime
    });
  }

  static async signIn({ email, password, ip, ua }: TSignIn) {
    const user = await UserService.findUserWithProvidersByEmail({ email });

    if (!user) {
      throw new InvalidCredentialsError();
    }
    if (!user.password) {
      throw new PasswordNotSetError();
    }

    try {
      await this.checkPassword({
        password,
        passwordHash: user.password
      });
    } catch (error) {
      if (error instanceof IncorrectPasswordError) {
        throw new InvalidCredentialsError();
      }
      throw error;
    }

    const providers = user.OAuthProvider;

    return this.createAuthData({ user, providers, ip, ua });
  }

  static async requestSignInCode({ email, ip, requestTime }: TRequestAuthCode) {
    const userExist = await UserService.findUserByEmail({ email });

    if (!userExist) {
      throw new EmailNotFoundError();
    }

    const codeKey = this.getSignInCodeKey({ email });

    const { code } = await CodeService.createCode({
      idKey: codeKey
    });

    const requestIpData = await ipdata.getIPData(ip);

    await MailService.sendSignInCode({
      code,
      email,
      requestIp: ip,
      requestIpData,
      requestTime
    });
  }

  static async signInByCode({ email, code, ip, ua }: TVerifySignInCode) {
    const user = await UserService.findUserWithProvidersByEmail({ email });

    if (!user) {
      throw new EmailNotFoundError();
    }

    const codeKey = this.getSignInCodeKey({ email });

    await CodeService.verifyCode({ idKey: codeKey, code });

    const providers = user.OAuthProvider;

    return this.createAuthData({ user, providers, ip, ua });
  }

  static async requestPasswordResetCode({
    email,
    ip,
    requestTime
  }: TRequestAuthCode) {
    const userExist = await UserService.findUserByEmail({ email });

    if (!userExist) {
      throw new EmailNotFoundError();
    }

    const codeKey = this.getPasswordResetCodeKey({ email });

    const { code } = await CodeService.createCode({
      idKey: codeKey
    });

    const requestIpData = await ipdata.getIPData(ip);

    await MailService.sendPasswordResetCode({
      code,
      email,
      requestIp: ip,
      requestIpData,
      requestTime
    });
  }

  static async resetPassword({
    email,
    newPassword,
    code,
    ip,
    ua
  }: TResetPassword) {
    const user = await UserService.findUserWithProvidersByEmail({ email });

    if (!user) {
      throw new EmailNotFoundError();
    }

    const codeKey = this.getPasswordResetCodeKey({ email });

    await CodeService.verifyCode({ idKey: codeKey, code });

    const providers = user.OAuthProvider;

    const hashNewPassword = await AuthService.makeHashPassword({
      password: newPassword
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashNewPassword }
    });

    return this.createAuthData({ user, providers, ip, ua });
  }

  static async oauthCallback({
    code,
    codeVerifier,
    providerName,
    ip,
    ua
  }: TOAuthCallback): Promise<TOAuthCallbackDataReturned> {
    const providerUserData = await OAuthService.getProviderUserData({
      providerName,
      code,
      codeVerifier
    });

    const { providerUserId } = providerUserData;

    const provider = await prisma.oAuthProvider.findUnique({
      where: {
        providerName_providerUserId: {
          providerUserId,
          providerName
        }
      },
      include: { user: { include: { OAuthProvider: true } } }
    });

    if (provider) {
      // вход в систему

      const user = provider.user;
      const providers = provider.user.OAuthProvider;

      return this.createAuthData({ user, providers, ip, ua });
    } else {
      const { email, emailVerified = false } = providerUserData;

      if (email) {
        const user = await UserService.findUserWithProvidersByEmail({ email });

        if (user) {
          if (emailVerified) {
            // вход в систему с добавлением нового провайдера
            const providers = user.OAuthProvider;

            const provider = await prisma.oAuthProvider.create({
              data: {
                providerName,
                providerUserId,
                userId: user.id
              }
            });
            providers.push(provider);

            return this.createAuthData({ user, providers, ip, ua });
          } else {
            // попытка входа (необходимо подтвердить почту, чтобы войти, также создав запись текущего провайдера)
            const attemptId = nanoid();

            const attemptRecordKey = this.getOAuthSignInAttemptKey({
              attemptId
            });

            const record: TOAuthSignInAttemptRecord = {
              ...providerUserData,
              email,
              providerName
            };

            await redis.setEx(
              attemptRecordKey,
              OAUTH_ATTEMPT_EXPIRATION_SECONDS,
              JSON.stringify(record)
            );

            return {
              attemptId,
              method: 'sign-in',
              emailVerified
            };
          }
        }
        // если пользователь не найден, то зарегистрировать ниже
      }

      // регистрация нового пользователя
      const missingFields = OAUTH_SIGN_UP_ATTEMPT_REQUIRED_FIELDS.filter(
        (field) => !providerUserData[field]
      );

      if (!missingFields.length && providerUserData.emailVerified) {
        // регистрация пользователя и создание записи провайдера
        const { avatarUrl } = providerUserData;

        const firstName = providerUserData.firstName!;
        const lastName = providerUserData.lastName!;
        const email = providerUserData.email!;

        const { avatarFilename, avatarBackgroundFilename } =
          AvatarService.generateAvatarFilenames();

        await AvatarService.createDefaultAvatarBackground({
          avatarBackgroundFilename
        });

        let hasImage = false;
        if (avatarUrl) {
          hasImage = await AvatarService.downloadAndSaveOAuthAvatar({
            avatarFilename,
            avatarUrl
          });
        }
        if (!hasImage) {
          await AvatarService.createDefaultAvatar({
            avatarBackgroundFilename,
            avatarFilename,
            firstName,
            lastName
          });
        }

        const provider = await prisma.oAuthProvider.create({
          data: {
            providerName,
            providerUserId,
            user: {
              create: {
                firstName,
                lastName,
                email,
                role: INITIAL_USER_ROLE,
                hasImage,
                avatarFilename,
                avatarBackgroundFilename
              }
            }
          },
          include: { user: true }
        });

        const user = provider.user;
        const providers = [provider];

        return this.createAuthData({ user, providers, ip, ua });
      } else {
        const attemptId = nanoid();

        const attemptRecordKey = this.getOAuthSignUpAttemptKey({
          attemptId
        });

        const record: TOAuthSignUpAttemptRecord = {
          ...providerUserData,
          providerName
        };

        await redis.setEx(
          attemptRecordKey,
          OAUTH_ATTEMPT_EXPIRATION_SECONDS,
          JSON.stringify(record)
        );

        return {
          attemptId,
          method: 'sign-up',
          missingFields,
          emailVerified
        };
      }
    }
  }

  static async requestOAuthSignUpAttemptCode({
    attemptId,
    email: userEmail,
    ip,
    requestTime
  }: TRequestOAuthSignUpAttemptCode) {
    const attemptRecordKey = this.getOAuthSignUpAttemptKey({
      attemptId
    });

    const record = await redis.get(attemptRecordKey);

    if (!record) {
      throw new OAuthSignUpAttemptNotFoundOrExpiredError();
    }

    const recordData = JSON.parse(record) as TOAuthSignUpAttemptRecord;
    const {
      providerUserId,
      email: providerEmail,
      providerName,
      emailVerified
    } = recordData;

    if (emailVerified) {
      throw new EmailAlreadyVerifiedError();
    }

    const email = providerEmail || userEmail;

    if (!email) {
      throw new TOAuthSignUpAttemptRequiredDataError({
        requiredFields: ['email']
      });
    }

    const [providerExist, userExist] = await Promise.all([
      prisma.oAuthProvider.findUnique({
        where: {
          providerName_providerUserId: {
            providerUserId,
            providerName
          }
        }
      }),
      UserService.findUserByEmail({ email })
    ]);

    if (providerExist || userExist) {
      // процесс входа через провайдера необходимо начать заново
      await redis.del(attemptRecordKey);
      throw new OAuthAttemptError();
    }

    const codeKey = this.getOAuthSignUpCodeKey({ email });

    const { code } = await CodeService.createCode({ idKey: codeKey });

    const requestIpData = await ipdata.getIPData(ip);

    await MailService.sendUserActivationCode({
      code,
      email,
      requestIp: ip,
      requestIpData,
      requestTime
    });
  }

  static async oauthSignUpAttempt({
    attemptId,
    code,
    data,
    ip,
    ua
  }: TOAuthSignUpAttempt) {
    const attemptRecordKey = this.getOAuthSignUpAttemptKey({ attemptId });

    const record = await redis.get(attemptRecordKey);

    if (!record) {
      throw new OAuthSignUpAttemptNotFoundOrExpiredError();
    }

    const recordData = JSON.parse(record) as TOAuthSignUpAttemptRecord;

    const {
      providerUserId,
      providerName,
      avatarUrl,
      emailVerified = false
    } = recordData;

    const codeRequired = !emailVerified;

    const dataToSaved = OAUTH_SIGN_UP_ATTEMPT_REQUIRED_FIELDS.reduce(
      (acc, field) => {
        const value = recordData[field] || data[field];
        if (!value) {
          // если какого-то значения нет, то определяем необходимые поля, которые ожидали, что будут в запросе
          const requiredFields = OAUTH_SIGN_UP_ATTEMPT_REQUIRED_FIELDS.filter(
            (field) => !recordData[field]
          );
          throw new TOAuthSignUpAttemptRequiredDataError({
            requiredFields,
            codeRequired
          });
        }

        acc[field] = value;
        return acc;
      },
      {} as Required<TOAuthSignUpAttemptFieldsData>
    );

    if (!emailVerified && !code) {
      throw new TOAuthSignUpAttemptRequiredDataError({
        requiredFields: [],
        codeRequired
      });
    }

    const { email, firstName, lastName } = dataToSaved;

    const [providerExist, emailExist] = await Promise.all([
      prisma.oAuthProvider.findUnique({
        where: {
          providerName_providerUserId: {
            providerUserId,
            providerName
          }
        }
      }),
      UserService.findUserByEmail({
        email
      })
    ]);

    if (providerExist) {
      // если провайдер существует, значит необходимо начать процесс регистрации заново
      await redis.del(attemptRecordKey);
      throw new OAuthAttemptError();
    }

    if (emailExist) {
      if (recordData.email) {
        // если поиск произошел по email в данных провайдера, то попытка входа бессмыслена, процесс регистрации через провайдера должен начаться заново
        await redis.del(attemptRecordKey);
        throw new OAuthAttemptError();
      } else {
        // если пользователь сам предоставил почту, которая уже существует
        throw new EmailAlreadyTakenError();
      }
    }

    if (codeRequired) {
      const codeKey = this.getOAuthSignUpCodeKey({ email });
      // code определен в области codeRequired=true
      await CodeService.verifyCode({ idKey: codeKey, code: code! });
    }

    await redis.del(attemptRecordKey);

    const { avatarFilename, avatarBackgroundFilename } =
      AvatarService.generateAvatarFilenames();

    await AvatarService.createDefaultAvatarBackground({
      avatarBackgroundFilename
    });

    let hasImage = false;

    if (avatarUrl) {
      hasImage = await AvatarService.downloadAndSaveOAuthAvatar({
        avatarFilename,
        avatarUrl
      });
      if (!hasImage) {
        await AvatarService.createDefaultAvatar({
          avatarFilename,
          avatarBackgroundFilename,
          firstName,
          lastName
        });
      }
    }

    const provider = await prisma.oAuthProvider.create({
      data: {
        providerName,
        providerUserId,
        user: {
          create: {
            firstName,
            lastName,
            email,
            avatarBackgroundFilename,
            avatarFilename,
            hasImage,
            role: INITIAL_USER_ROLE
          }
        }
      },
      include: {
        user: true
      }
    });
    const user = provider.user;
    const providers = [provider];

    return this.createAuthData({ user, providers, ip, ua });
  }

  static async requestOAuthSignInAttemptCode({
    attemptId,
    ip,
    requestTime
  }: TRequestOAuthSignInAttemptCode) {
    const attemptRecordKey = this.getOAuthSignInAttemptKey({
      attemptId
    });

    const record = await redis.get(attemptRecordKey);

    if (!record) {
      throw new OAuthSignInAttemptNotFoundOrExpiredError();
    }

    const { providerUserId, email, providerName } = JSON.parse(
      record
    ) as TOAuthSignInAttemptRecord;

    const [user, providerExist] = await Promise.all([
      UserService.findUserByEmail({
        email
      }),
      prisma.oAuthProvider.findUnique({
        where: {
          providerName_providerUserId: {
            providerUserId,
            providerName
          }
        }
      })
    ]);

    if (!user || providerExist) {
      // процесс входа через провайдера необходимо начать заново
      await redis.del(attemptRecordKey);
      throw new OAuthAttemptError();
    }

    const codeKey = this.getOAuthSignInCodeKey({ email });

    const { code } = await CodeService.createCode({ idKey: codeKey });

    const requestIpData = await ipdata.getIPData(ip);

    await MailService.sendSignInCode({
      code,
      email,
      requestIp: ip,
      requestIpData,
      requestTime
    });
  }

  static async oauthSignInAttempt({
    attemptId,
    code,
    ip,
    ua
  }: TOAuthSignInAttempt) {
    const attemptRecordKey = this.getOAuthSignInAttemptKey({
      attemptId
    });

    const record = await redis.get(attemptRecordKey);

    if (!record) {
      throw new OAuthSignInAttemptNotFoundOrExpiredError();
    }

    const { providerUserId, email, providerName, avatarUrl } = JSON.parse(
      record
    ) as TOAuthSignInAttemptRecord;

    const [user, providerExist] = await Promise.all([
      UserService.findUserWithProvidersByEmail({
        email
      }),
      prisma.oAuthProvider.findUnique({
        where: {
          providerName_providerUserId: {
            providerUserId,
            providerName
          }
        }
      })
    ]);

    if (!user || providerExist) {
      // процесс входа через провайдера необходимо начать заново
      await redis.del(attemptRecordKey);
      throw new OAuthAttemptError();
    }

    const codeKey = this.getOAuthSignInCodeKey({ email });

    await CodeService.verifyCode({
      idKey: codeKey,
      code
    });
    await redis.del(attemptRecordKey);

    const { avatarFilename } = user;

    const [provider] = await Promise.all([
      prisma.oAuthProvider.create({
        data: {
          userId: user.id,
          providerName,
          providerUserId
        }
      }),
      (async function () {
        if (avatarUrl && !user.hasImage) {
          const updated = await AvatarService.downloadAndSaveOAuthAvatar({
            avatarFilename,
            avatarUrl
          });
          if (updated) {
            await prisma.user.update({
              where: { id: user.id },
              data: { hasImage: true }
            });
            user.hasImage = true;
          }
        }
      })()
    ]);

    const providers = user.OAuthProvider;
    providers.push(provider);

    return this.createAuthData({ user, providers, ip, ua });
  }

  static async signOutSession({
    userId,
    sessionId,
    targetSessionId
  }: TSignOutSession) {
    const isCurrentSession = sessionId === targetSessionId;

    if (isCurrentSession) {
      await SessionService.deleteSession({
        userId,
        sessionId
      });
    } else {
      const sessions = await SessionService.getAllUserSessions({
        userId
      });

      const currentSession = sessions[sessionId];

      if (!currentSession) {
        throw new CurrentSessionNotFoundOrExpiredError();
      }

      const targetSession = sessions[targetSessionId];

      if (!targetSession) {
        throw new SessionNotFoundError();
      }

      await SessionService.deleteSession({
        userId,
        sessionId: targetSessionId
      });
    }

    return { currentDeleted: isCurrentSession };
  }

  static async signOutAll({ userId, sessionId }: TSignOutAll) {
    const currentSession = await SessionService.getSession({
      userId,
      sessionId
    });

    if (!currentSession) {
      throw new CurrentSessionNotFoundOrExpiredError();
    }

    await SessionService.deleteAllUserSessions({ userId });
  }

  static async signOutAllExceptCurrent({
    userId,
    sessionId
  }: TSignOutAllExceptCurrent) {
    const sessions = await SessionService.getAllUserSessions({ userId });

    const currentSession = sessions[sessionId];

    if (!currentSession) {
      throw new CurrentSessionNotFoundOrExpiredError();
    }

    const sessionsToDelete = Object.entries(sessions).reduce<Promise<void>[]>(
      (acc, [key]) => {
        if (key !== sessionId) {
          acc.push(
            SessionService.deleteSession({
              userId,
              sessionId: key
            })
          );
        }
        return acc;
      },
      []
    );

    await Promise.all(sessionsToDelete);
  }

  static async refreshTokens({
    userId,
    sessionId,
    tokenSignature,
    ip,
    ua
  }: TRefreshTokens) {
    const [user, session] = await Promise.all([
      UserService.findUserWithProvidersById({ userId }),
      SessionService.getSession({
        userId,
        sessionId
      })
    ]);

    // если сессия есть, то до проверки ошибок ее нужно удалить, чтобы повторно нельзя было проверить сессию
    if (session) {
      await SessionService.deleteSession({
        userId,
        sessionId
      });
    }

    if (!user) {
      throw new CurrentUserNotFoundError();
    }

    if (!session) {
      throw new CurrentSessionNotFoundOrExpiredError();
    }

    if (session.tokenSignature !== tokenSignature) {
      throw new CurrentSessionSignatureMismatchError();
    }

    const providers = user.OAuthProvider;

    return this.createAuthData({ user, providers, ip, ua });
  }
}
