import {
  CurrentSessionNotFoundOrExpiredError,
  CurrentUserNotFoundError,
  EmailAlreadyTakenError,
  PasswordAlreadySetError,
  PasswordNotSetError
} from '#/errors/classes.errors';
import { ipdata, prisma } from '#/providers';
import {
  AuthService,
  AvatarService,
  CodeService,
  MailService,
  SessionService
} from '#/services';
import {
  TChangeEmail,
  TChangePassword,
  TDeleteUser,
  TDeleteUserAvatar,
  TFindUserByEmail,
  TFindUserById,
  TFindUserWithProvidersByEmail,
  TFindUserWithProvidersById,
  TGetUserDataReturned,
  TGetUserInfo,
  TGetVerifyCodeKey,
  TRequestEmailChangeCode,
  TRequestUserDeletionCode,
  TSetPassword,
  TUpdateUserInfo,
  TUploadUserAvatar,
  TUserDataReturned
} from '#/types/user.types';

export class UserService {
  static async findUserByEmail({ email }: TFindUserByEmail) {
    return await prisma.user.findUnique({ where: { email } });
  }

  static async findUserWithProvidersByEmail({
    email
  }: TFindUserWithProvidersByEmail) {
    return await prisma.user.findUnique({
      where: { email },
      include: { OAuthProvider: true }
    });
  }

  static async findUserById({ userId }: TFindUserById) {
    return await prisma.user.findUnique({ where: { id: userId } });
  }

  static async findUserWithProvidersById({
    userId
  }: TFindUserWithProvidersById) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { OAuthProvider: true }
    });
  }

  static getUserDataReturned({
    user,
    providers,
    sessionsInfo
  }: TGetUserDataReturned): TUserDataReturned {
    const {
      firstName,
      lastName,
      email,
      password,
      hasImage,
      createdAt,
      updatedAt,
      avatarFilename
    } = user;

    const externalAccounts = providers.map((provider) => ({
      id: provider.id,
      providerName: provider.providerName,
      linkedAt: provider.linkedAt.getTime()
    }));

    const avatarUrl = AvatarService.getAvatarUrl({ avatarFilename });

    return {
      firstName,
      lastName,
      email,
      hasPassword: !!password,
      hasImage,
      createdAt: createdAt.getTime(),
      updatedAt: updatedAt.getTime(),
      avatarUrl,
      externalAccounts,
      sessions: sessionsInfo
    };
  }

  static async getUserInfo({ userId, sessionId }: TGetUserInfo) {
    const [user, sessions] = await Promise.all([
      this.findUserWithProvidersById({ userId }),
      SessionService.getAllUserSessions({ userId })
    ]);

    const currentSession = sessions[sessionId];

    if (!currentSession) {
      throw new CurrentSessionNotFoundOrExpiredError();
    }

    if (!user) {
      throw new CurrentUserNotFoundError();
    }

    const sessionsInfo = await SessionService.getUserSessionsInfo({
      sessions
    });

    const userData = this.getUserDataReturned({
      user,
      providers: user.OAuthProvider,
      sessionsInfo
    });

    return { user: userData };
  }

  static async updateUserInfo({
    userId,
    firstName,
    lastName
  }: TUpdateUserInfo) {
    const user = await this.findUserById({ userId });

    if (!user) {
      throw new CurrentUserNotFoundError();
    }

    if (!user.hasImage) {
      const { avatarFilename, avatarBackgroundFilename } = user;
      await AvatarService.createDefaultAvatar({
        avatarFilename,
        avatarBackgroundFilename,
        firstName,
        lastName
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName }
    });
  }

  private static getEmailChangeCodeKey({ userId }: TGetVerifyCodeKey) {
    return `email-change:${userId}`;
  }

  private static getUserDeletionCodeKey({ userId }: TGetVerifyCodeKey) {
    return `user-deletion:${userId}`;
  }

  static async requestEmailChangeCode({
    userId,
    newEmail,
    ip,
    requestTime
  }: TRequestEmailChangeCode) {
    const [user, newEmailExist] = await Promise.all([
      this.findUserById({ userId }),
      this.findUserByEmail({ email: newEmail })
    ]);

    if (!user) {
      throw new CurrentUserNotFoundError();
    }
    if (newEmailExist) {
      throw new EmailAlreadyTakenError();
    }

    const codeKey = this.getEmailChangeCodeKey({ userId });

    const { code } = await CodeService.createCode({
      idKey: codeKey
    });

    const requestIpData = await ipdata.getIPData(ip);

    await MailService.sendEmailChangeCode({
      code,
      email: newEmail,
      requestIp: ip,
      requestIpData,
      requestTime
    });
  }

  static async changeEmail({ userId, newEmail, code }: TChangeEmail) {
    const [user, newEmailExist] = await Promise.all([
      this.findUserById({ userId }),
      this.findUserByEmail({ email: newEmail })
    ]);

    if (!user) {
      throw new CurrentUserNotFoundError();
    }
    if (newEmailExist) {
      throw new EmailAlreadyTakenError();
    }

    const codeKey = this.getEmailChangeCodeKey({ userId });

    await CodeService.verifyCode({ idKey: codeKey, code });

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        email: newEmail
      }
    });
  }

  static async requestUserDeletionCode({
    userId,
    ip,
    requestTime
  }: TRequestUserDeletionCode) {
    const user = await this.findUserById({ userId });

    if (!user) {
      throw new CurrentUserNotFoundError();
    }

    const codeKey = this.getUserDeletionCodeKey({ userId });

    const { code } = await CodeService.createCode({ idKey: codeKey });

    const requestIpData = await ipdata.getIPData(ip);

    await MailService.sendUserDeletionCode({
      code,
      email: user.email,
      requestIp: ip,
      requestIpData,
      requestTime
    });
  }

  static async deleteUser({ userId, code }: TDeleteUser) {
    const user = await this.findUserById({ userId });

    if (!user) {
      throw new CurrentUserNotFoundError();
    }

    const codeKey = this.getUserDeletionCodeKey({ userId });

    await CodeService.verifyCode({ idKey: codeKey, code });

    await Promise.all([
      prisma.user.delete({
        where: { id: userId }
      }),
      SessionService.deleteAllUserSessions({ userId })
    ]);
  }

  static async changePassword({
    userId,
    sessionId,
    currentPassword,
    newPassword,
    signOutOtherSessions
  }: TChangePassword) {
    const user = await this.findUserById({ userId });

    if (!user) {
      throw new CurrentUserNotFoundError();
    }
    if (!user.password) {
      throw new PasswordNotSetError();
    }

    await AuthService.checkPassword({
      password: currentPassword,
      passwordHash: user.password
    });

    if (signOutOtherSessions) {
      await AuthService.signOutAllExceptCurrent({
        userId,
        sessionId
      });
    }
    const hashNewPassword = await AuthService.makeHashPassword({
      password: newPassword
    });

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashNewPassword }
    });
  }

  static async setPassword({
    userId,
    sessionId,
    newPassword,
    signOutOtherSessions
  }: TSetPassword) {
    const user = await this.findUserById({ userId });

    if (!user) {
      throw new CurrentUserNotFoundError();
    }
    if (user.password) {
      throw new PasswordAlreadySetError();
    }

    if (signOutOtherSessions) {
      await AuthService.signOutAllExceptCurrent({ userId, sessionId });
    }

    const hashNewPassword = await AuthService.makeHashPassword({
      password: newPassword
    });

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashNewPassword }
    });
  }

  static async uploadUserAvatar({
    userId,
    avatarTempFilepath
  }: TUploadUserAvatar) {
    const user = await this.findUserById({ userId });

    if (!user) {
      throw new CurrentUserNotFoundError();
    }

    const { avatarFilename } = user;

    await AvatarService.saveUserAvatar({
      avatarFilename,
      avatarTempFilepath
    });

    if (!user.hasImage) {
      await prisma.user.update({
        where: { id: userId },
        data: { hasImage: true }
      });
    }

    const avatarUrl = AvatarService.getAvatarUrl({ avatarFilename });

    return { avatarUrl };
  }

  static async deleteUserAvatar({ userId }: TDeleteUserAvatar) {
    const user = await this.findUserById({ userId });

    if (!user) {
      throw new CurrentUserNotFoundError();
    }

    const { avatarFilename } = user;

    if (user.hasImage) {
      const { avatarBackgroundFilename, firstName, lastName } = user;

      await AvatarService.createDefaultAvatar({
        avatarBackgroundFilename,
        avatarFilename,
        firstName,
        lastName
      });

      await prisma.user.update({
        where: { id: userId },
        data: { hasImage: false }
      });
    }

    const avatarUrl = AvatarService.getAvatarUrl({ avatarFilename });

    return { avatarUrl };
  }
}
