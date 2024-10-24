import { TOAuthStrategy } from '#/types/oauth.types';
import { TToken } from '#/types/token.types';
import { capitalizeFirstLetter } from '#/utils/capitalize-first-letter.utility';

export class UnexpectedError extends Error {
  constructor(error: string | Error) {
    if (typeof error === 'string') {
      super(error);
    } else {
      super(error.message, { cause: error });
    }
    this.name = this.constructor.name;
  }
}

export class ApiError extends Error {
  status: number;

  constructor({
    status,
    message,
    cause
  }: {
    status: number;
    message: string;
    cause?: unknown;
  }) {
    super(message, { cause });
    this.status = status;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 400, message });
  }
}

export class JsonSyntaxError extends BadRequestError {
  constructor({ message }: { message: string }) {
    super({ message });
  }
}

export class CookieSyntaxError extends BadRequestError {
  constructor({ message }: { message: string }) {
    super({ message });
  }
}

export class UnauthorizedError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 401, message });
  }
}

export class OAuthError extends ApiError {
  strategy: TOAuthStrategy;

  constructor({
    status,
    message,
    strategy
  }: {
    status: number;
    message: string;
    strategy: TOAuthStrategy;
  }) {
    super({ status, message });
    this.strategy = strategy;
  }
}

export class OAuthStateMismatchError extends OAuthError {
  constructor({ strategy }: { strategy: TOAuthStrategy }) {
    super({
      status: 400,
      message: `OAuth state mismatch for provider ${strategy}. The state returned from the provider does not match the state stored locally.`,
      strategy
    });
  }
}

export class TokenExpiredError extends ApiError {
  expiredAt: Date;

  constructor({
    tokenType,
    expiredAt
  }: {
    tokenType: TToken;
    expiredAt: Date;
  }) {
    super({
      message: `${capitalizeFirstLetter(tokenType)} token has expired.`,
      status: 419
    });
    this.expiredAt = expiredAt;
  }
}

export class TokenVerifyError extends UnauthorizedError {
  constructor({ tokenType }: { tokenType: TToken }) {
    super({
      message: `${capitalizeFirstLetter(tokenType)} token verify error.`
    });
  }
}

export class InvalidTokenPayloadError extends UnauthorizedError {
  constructor({ tokenType }: { tokenType: TToken }) {
    super({
      message: `Invalid ${capitalizeFirstLetter(tokenType)} token payload.`
    });
  }
}

export class RefreshSessionNotFoundOrExpiredError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Refresh session not found or has expired.'
    });
  }
}

export class RefreshSessionInvalidSignatureError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Invalid refresh session. Wrong token signature.'
    });
  }
}

export class IncorrectPasswordError extends ApiError {
  constructor() {
    super({
      status: 403,
      message: 'Password is incorrect. Try again, or use another method.'
    });
  }
}

export class EmailAlreadyTakenError extends ApiError {
  constructor() {
    super({
      status: 409,
      message: 'This email address is taken. Please try another.'
    });
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super({
      status: 401,
      message: 'Email or password incorrect.'
    });
  }
}
export class EmailNotFoundError extends ApiError {
  constructor() {
    super({
      status: 404,
      message: 'Email address not found.'
    });
  }
}

export class UserNotFoundError extends UnauthorizedError {
  constructor() {
    super({
      message: 'User not found.'
    });
  }
}

export class PasswordNotSetError extends BadRequestError {
  constructor() {
    super({
      message: 'No password has been set for this email address.'
    });
  }
}

export class PasswordAlreadySetError extends BadRequestError {
  constructor() {
    super({
      message: 'A password has already been set for this email address.'
    });
  }
}

export class AvatarError extends ApiError {
  constructor({ message }: { message: string }) {
    super({
      status: 400,
      message
    });
  }
}

export class FileError extends ApiError {
  constructor({ status, message }: { status: number; message: string }) {
    super({ status, message });
  }
}

export class FileLimitError extends FileError {
  maxFileBytes: number;

  constructor({ maxFileBytes }: { maxFileBytes: number }) {
    super({
      status: 413,
      message:
        'File size exceeds the maximum limit. Please upload a smaller file.'
    });
    this.maxFileBytes = maxFileBytes;
  }
}

export class FileExtensionError extends FileError {
  allowedExtensions: string[];

  constructor({ allowedExtensions }: { allowedExtensions: string[] }) {
    super({
      status: 400,
      message:
        'Invalid or undefined file extension. Please ensure the file is a valid file format.'
    });
    this.allowedExtensions = allowedExtensions;
  }
}

export class RouteNotFoundError extends ApiError {
  constructor() {
    super({
      status: 404,
      message: '404 - not found.'
    });
  }
}

export class ValidationError extends ApiError {
  errors: unknown[];

  constructor({ errors, cause }: { errors: unknown[]; cause?: unknown }) {
    super({ status: 400, cause, message: 'Validation error occurred.' });
    this.errors = errors;
  }
}

export class CodeError extends ApiError {
  constructor({ status, message }: { status: number; message: string }) {
    super({ status, message });
  }
}

export class CodeMaxAttemptsExceededError extends CodeError {
  constructor() {
    super({
      status: 429,
      message: 'No attempts left. Please request a new code.'
    });
  }
}

export class CodeRateLimitError extends CodeError {
  allowedAt: Date;

  constructor({ allowedAt }: { allowedAt: Date }) {
    super({
      status: 429,
      message: 'Please wait before requesting a new code.'
    });
    this.allowedAt = allowedAt;
  }
}

export class CodeNotFoundOrExpiredError extends CodeError {
  constructor() {
    super({
      status: 404,
      message: 'Verification code not found or expired.'
    });
  }
}

export class CodeIncorrectError extends CodeError {
  attemptsLeft: number;

  constructor({ attemptsLeft }: { attemptsLeft: number }) {
    super({
      status: 400,
      message: `Verification code is incorrect. Attempts left: ${attemptsLeft}.`
    });
    this.attemptsLeft = attemptsLeft;
  }
}
