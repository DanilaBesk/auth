import { redis, prisma, ipdata } from '#/providers';
import { MailService } from '#/services/mail.service';
import {
  ACTIVATION_CODE_ATTEMPTS_LIMIT,
  ACTIVATION_CODE_EXPIRE_IN,
  ACTIVATION_CODE_REQUEST_INTERVAL_SECONDS
} from '#/constants/user.constants';
import {
  ActivationCodeIncorrectError,
  ActivationCodeNotFoundOrExpiredError,
  ActivationMaxAttemptsExceededError,
  ActivationRateLimitError,
  UserEmailConflictError
} from '#/errors/classes.errors';
import {
  TActivationRecord,
  TCreateActivationRecord,
  TCreateUser,
  TFindUserByEmail,
  TFindUserById,
  TGetUserActivationKey,
  TVerifyActivationCode
} from '#/types/user.types';

export class UserService {
  private static generateSixDigitCode() {
    const random = Math.floor(Math.random() * 1000000);
    return random.toString().padStart(6, '0');
  }

  private static getUserActivationKey({ email }: TGetUserActivationKey) {
    return `activation:${email}`;
  }
  static async createUser({ email, password, role }: TCreateUser) {
    return await prisma.user.create({
      data: { email, password, role }
    });
  }

  static async findUserByEmail({ email }: TFindUserByEmail) {
    return await prisma.user.findUnique({ where: { email } });
  }

  static async findUserById({ id }: TFindUserById) {
    return await prisma.user.findUnique({ where: { id } });
  }

  static async createActivationRecord({ email, ip }: TCreateActivationRecord) {
    const candidate = await this.findUserByEmail({ email });
    if (candidate) {
      throw new UserEmailConflictError();
    }

    const userActivationKey = this.getUserActivationKey({ email });

    const record = await redis.get(userActivationKey);

    if (record) {
      const { createdAt } = JSON.parse(record) as TActivationRecord;

      const secondsSinceCreation = (Date.now() - createdAt) / 1000;

      const secondsUntilNextCode =
        ACTIVATION_CODE_REQUEST_INTERVAL_SECONDS - secondsSinceCreation;

      if (secondsUntilNextCode > 0) {
        throw new ActivationRateLimitError({ createdAt: new Date(createdAt) });
      }
    }

    const newRecord: TActivationRecord = {
      code: this.generateSixDigitCode(),
      attempts: ACTIVATION_CODE_ATTEMPTS_LIMIT,
      createdAt: Date.now()
    };

    const requestTime = new Date();

    const [ipData] = await Promise.all([
      ipdata.getIPData(ip),
      redis.setEx(
        userActivationKey,
        ACTIVATION_CODE_EXPIRE_IN,
        JSON.stringify(newRecord)
      )
    ]);

    await MailService.sendActivationCode({
      code: newRecord.code,
      toEmail: email,
      requestIp: ip,
      requestIpData: ipData,
      requestTime
    });
  }

  static async verifyActivationCode({ email, code }: TVerifyActivationCode) {
    const userActivationKey = this.getUserActivationKey({ email });

    const record = await redis.get(userActivationKey);
    if (!record) {
      throw new ActivationCodeNotFoundOrExpiredError();
    }

    const recordData = JSON.parse(record) as TActivationRecord;

    if (recordData.attempts <= 0) {
      throw new ActivationMaxAttemptsExceededError();
    }
    if (code !== recordData.code) {
      recordData.attempts -= 1;
      await redis.set(userActivationKey, JSON.stringify(recordData), {
        KEEPTTL: true
      });

      throw new ActivationCodeIncorrectError({
        attemptsLeft: recordData.attempts
      });
    }

    await redis.del(userActivationKey);
  }
}
