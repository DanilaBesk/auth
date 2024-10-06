import { ipdata, prisma } from '#/providers';
import { CodeService, MailService, TokenService } from '#/services';
import {
  UserEmailConflictError,
  UserIdNotFoundError
} from '#/errors/classes.errors';
import {
  TChangeEmailWithCodeVerification,
  TCreateUser,
  TFindUserByEmail,
  TFindUserById,
  TGetUserActivationRecordKey,
  TGetEmailChangeRecordKey,
  TGetUserDeletionRecordKey,
  TRequestEmailChangeCode,
  TRequestUserActivationCode,
  TVerifyUserActivationCode,
  TRequestUserDeletionCode,
  TDeleteUserWithCodeVerification
} from '#/types/user.types';

export class UserService {
  static async createUser({ email, password, role }: TCreateUser) {
    return await prisma.user.create({
      data: { email, password, role }
    });
  }

  static async findUserByEmail({ email }: TFindUserByEmail) {
    return await prisma.user.findUnique({ where: { email } });
  }

  static async findUserById({ userId }: TFindUserById) {
    return await prisma.user.findUnique({ where: { id: userId } });
  }

  private static getUserActivationRecordKey({
    email
  }: TGetUserActivationRecordKey) {
    return `user-activation:${email}`;
  }

  private static getEmailChangeRecordKey({ userId }: TGetEmailChangeRecordKey) {
    return `email-change:${userId}`;
  }

  private static getUserDeletionRecordKey({
    userId
  }: TGetUserDeletionRecordKey) {
    return `user-deletion:${userId}`;
  }

  static async requestUserActivationCode({
    email,
    ip,
    requestTime
  }: TRequestUserActivationCode) {
    const candidate = await this.findUserByEmail({ email });

    if (candidate) {
      throw new UserEmailConflictError();
    }

    const recordKey = this.getUserActivationRecordKey({ email });

    const { code } = await CodeService.createCodeRecord({
      recordKey
    });

    const ipData = await ipdata.getIPData(ip);

    await MailService.sendUserActivationCode({
      code: code,
      email,
      requestIp: ip,
      requestIpData: ipData,
      requestTime
    });
  }

  static async verifyUserActivationCode({
    email,
    code
  }: TVerifyUserActivationCode) {
    const recordKey = this.getUserActivationRecordKey({ email });

    await CodeService.verifyCodeRecord({ recordKey, code });
  }

  static async requestEmailChangeCode({
    userId,
    newEmail,
    ip,
    requestTime
  }: TRequestEmailChangeCode) {
    const [user, userWithNewEmail] = await Promise.all([
      this.findUserById({ userId }),
      this.findUserByEmail({ email: newEmail })
    ]);

    if (!user) {
      throw new UserIdNotFoundError();
    }
    if (userWithNewEmail) {
      throw new UserEmailConflictError();
    }

    const recordKey = this.getEmailChangeRecordKey({ userId });

    const { code } = await CodeService.createCodeRecord({
      recordKey
    });

    const ipData = await ipdata.getIPData(ip);

    await MailService.sendEmailChangeCode({
      code: code,
      email: newEmail,
      requestIp: ip,
      requestIpData: ipData,
      requestTime
    });
  }

  static async changeEmailWithCodeVerification({
    userId,
    newEmail,
    code
  }: TChangeEmailWithCodeVerification) {
    const [user, userWithNewEmail] = await Promise.all([
      this.findUserById({ userId }),
      this.findUserByEmail({ email: newEmail })
    ]);

    if (!user) {
      throw new UserIdNotFoundError();
    }
    if (userWithNewEmail) {
      throw new UserEmailConflictError();
    }

    const recordKey = this.getEmailChangeRecordKey({ userId });

    await CodeService.verifyCodeRecord({ recordKey, code });

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
      throw new UserIdNotFoundError();
    }

    const recordKey = this.getUserDeletionRecordKey({ userId });

    const { code } = await CodeService.createCodeRecord({
      recordKey
    });

    const ipData = await ipdata.getIPData(ip);

    await MailService.sendUserDeletionCode({
      code: code,
      email: user.email,
      requestIp: ip,
      requestIpData: ipData,
      requestTime
    });
  }

  static async deleteUserWithCodeVerification({
    userId,
    code
  }: TDeleteUserWithCodeVerification) {
    const user = this.findUserById({ userId });

    if (!user) {
      throw new UserIdNotFoundError();
    }

    const recordKey = this.getUserDeletionRecordKey({ userId });

    await CodeService.verifyCodeRecord({ recordKey, code });

    await Promise.all([
      prisma.user.delete({
        where: { id: userId }
      }),
      TokenService.deleteAllUserRefreshSessions({ userId })
    ]);
  }
}
