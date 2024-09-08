import {
  ACTIVATION_CODE_ATTEMPTS_LIMIT,
  ACTIVATION_CODE_EXPIRE_IN,
  ACTIVATION_CODE_REQUEST_INTERVAL_SECONDS
} from '#/constants/auth.constants';
import {
  ActivationCodeIncorrect,
  ActivationCodeNotFoundOrExpired,
  ActivationMaxAttemptsExceededError,
  ActivationRateLimitError
} from '#/errors/api-error';
import { redis } from '#/providers/redis.provider';
import {
  TCreateActivationRecord,
  TVerifyActivationCode
} from '#/types/user.types';

const generateSixDigitCode = () => {
  return Math.floor(Math.random() * 1000000);
};

export class Activation {
  static async createActivationRecord({
    email
  }: TCreateActivationRecord): Promise<{
    code: number;
    attempts: number;
    createdAt: number;
  }> {
    const userActivationKey = `activation:${email}`;

    const record = await redis.get(userActivationKey);

    if (record) {
      const createdAt = JSON.parse(record).createdAt as number;

      const secondsSinceCreation = (Date.now() - createdAt) / 1000;

      const secondsUntilNextCode =
        ACTIVATION_CODE_REQUEST_INTERVAL_SECONDS - secondsSinceCreation;

      if (secondsUntilNextCode > 0) {
        throw new ActivationRateLimitError({ secondsUntilNextCode });
      }
    }

    const newRecord = {
      code: generateSixDigitCode(),
      attempts: ACTIVATION_CODE_ATTEMPTS_LIMIT,
      createdAt: Date.now()
    };

    redis.setex(
      userActivationKey,
      ACTIVATION_CODE_EXPIRE_IN,
      JSON.stringify(newRecord)
    );

    return newRecord;
  }
  static async verifyActivationCode({
    email,
    code
  }: TVerifyActivationCode): Promise<void> {
    const userActivationKey = `activation:${email}`;

    const record = await redis.get(userActivationKey);
    if (!record) {
      throw new ActivationCodeNotFoundOrExpired();
    }

    const recordData = JSON.parse(record) as {
      attempts: number;
      code: number;
      createdAt: number;
    };

    const secondsSinceCreation = (Date.now() - recordData.createdAt) / 1000;
    const secondsUntilNextCode =
      ACTIVATION_CODE_REQUEST_INTERVAL_SECONDS - secondsSinceCreation;

    if (recordData.attempts <= 0) {
      throw new ActivationMaxAttemptsExceededError({ secondsUntilNextCode });
    }
    if (code !== recordData.code) {
      recordData.attempts -= 1;
      await redis.set(userActivationKey, JSON.stringify(recordData), 'KEEPTTL');

      throw new ActivationCodeIncorrect({ attemptsLeft: recordData.attempts });
    }

    await redis.del(userActivationKey);
  }
}
