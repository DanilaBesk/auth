import {
  CODE_EXPIRATION_SECONDS,
  CODE_MAX_ATTEMPTS,
  CODE_RECORD_RESET_TTL_SECONDS,
  CODE_REQUEST_INTERVALS_SECONDS
} from '#/constants/code.constants';
import {
  CodeIncorrectError,
  CodeMaxAttemptsExceededError,
  CodeNotFoundOrExpiredError,
  CodeRateLimitError
} from '#/errors/classes.errors';
import { redis } from '#/providers';
import {
  TCodeRecord,
  TCreateCode,
  TGetRecordKey,
  TVerifyCode
} from '#/types/code.types';

export class CodeService {
  private static generateSixDigitCode() {
    const random = Math.floor(Math.random() * 1000000);
    return random.toString().padStart(6, '0');
  }

  private static getRecordKey({ idKey }: TGetRecordKey) {
    return `code:${idKey}`;
  }

  static async createCode({ idKey }: TCreateCode) {
    const recordKey = this.getRecordKey({ idKey });
    const record = await redis.get(recordKey);
    let newRequestCount = 1;

    if (record) {
      const { createdAt, requestCount } = JSON.parse(record) as TCodeRecord;

      newRequestCount = requestCount + 1;

      const newInterval = CODE_REQUEST_INTERVALS_SECONDS[newRequestCount];

      const nextAllowedAt =
        newInterval !== undefined
          ? createdAt + newInterval * 1000
          : createdAt + CODE_RECORD_RESET_TTL_SECONDS * 1000;

      if (nextAllowedAt > Date.now()) {
        throw new CodeRateLimitError({
          allowedAt: new Date(nextAllowedAt)
        });
      }
    }

    const newRecord: TCodeRecord = {
      code: this.generateSixDigitCode(),
      attempts: CODE_MAX_ATTEMPTS,
      createdAt: Date.now(),
      requestCount: newRequestCount
    };

    await redis.setEx(
      recordKey,
      CODE_RECORD_RESET_TTL_SECONDS,
      JSON.stringify(newRecord)
    );

    return { code: newRecord.code };
  }

  static async verifyCode({ idKey, code }: TVerifyCode) {
    const recordKey = this.getRecordKey({ idKey });
    const record = await redis.get(recordKey);
    if (!record) {
      throw new CodeNotFoundOrExpiredError();
    }

    const recordData = JSON.parse(record) as TCodeRecord;

    const expiredAt = recordData.createdAt + CODE_EXPIRATION_SECONDS * 1000;

    if (expiredAt <= Date.now()) {
      throw new CodeNotFoundOrExpiredError();
    }

    if (recordData.attempts <= 0) {
      throw new CodeMaxAttemptsExceededError();
    }
    if (code !== recordData.code) {
      recordData.attempts -= 1;
      await redis.set(recordKey, JSON.stringify(recordData), {
        KEEPTTL: true
      });

      throw new CodeIncorrectError({
        attemptsLeft: recordData.attempts
      });
    }

    await redis.del(recordKey);
  }
}
