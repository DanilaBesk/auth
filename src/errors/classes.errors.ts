import {
  MAX_REFRESH_TOKENS_FOR_USER,
  REFRESH_SESSION_CANCELLATION_TIMEOUT_HOURS
} from '#/constants/auth.constants';
import { TokenType } from '#/types/token.types';
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

export class TokenExpiredError extends ApiError {
  expiredAt: Date;

  constructor({
    tokenType,
    expiredAt
  }: {
    tokenType: TokenType;
    expiredAt: Date;
  }) {
    super({
      message: `${capitalizeFirstLetter(tokenType)} token expired`,
      status: 419
    });
    this.expiredAt = expiredAt;
  }
}

export class TokenVerifyError extends UnauthorizedError {
  constructor({ tokenType }: { tokenType: TokenType }) {
    super({
      message: `${capitalizeFirstLetter(tokenType)} token verify error`
    });
  }
}

export class InvalidTokenPayloadError extends UnauthorizedError {
  constructor({ tokenType }: { tokenType: TokenType }) {
    super({
      message: `Invalid ${capitalizeFirstLetter(tokenType)} token payload`
    });
  }
}

export class RefreshSessionNotFoundOrExpiredError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Refresh session not found or has expired'
    });
  }
}

export class RefreshSessionInvalidFingerprintError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Invalid refresh session. Wrong fingerprint'
    });
  }
}

export class RefreshSessionInvalidSignatureError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Invalid refresh session. Wrong refresh token'
    });
  }
}

export class RefreshSessionCancellationTimeoutNotReachedError extends ApiError {
  allowedAt: Date;

  constructor({ allowedAt }: { allowedAt: Date }) {
    super({
      status: 403,
      message: `You cannot cancel other sessions until the required ${REFRESH_SESSION_CANCELLATION_TIMEOUT_HOURS}-hour period has elapsed`
    });
    this.allowedAt = allowedAt;
  }
}

export class MaxRefreshSessionsExceededError extends ApiError {
  constructor() {
    super({
      status: 429,
      message: `Cannot create more than ${MAX_REFRESH_TOKENS_FOR_USER} sessions`
    });
  }
}

export class InvalidUserCredentialsError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Invalid credentials'
    });
  }
}

export class InvalidPasswordError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Invalid password'
    });
  }
}

export class UserEmailConflictError extends ApiError {
  constructor() {
    super({
      status: 409,
      message: 'User already exists with this email address'
    });
  }
}

export class UserEmailNotFoundError extends ApiError {
  constructor() {
    super({
      status: 404,
      message: 'User not found with this email address'
    });
  }
}

export class UserIdNotFoundError extends ApiError {
  constructor() {
    super({
      status: 404,
      message: 'User not found with this ID'
    });
  }
}

export class RouteNotFoundError extends ApiError {
  url: string;
  method: string;

  constructor({ url, method }: { url: string; method: string }) {
    super({
      status: 404,
      message: `Route '${url}' not found with method ${method}`
    });
    this.url = url;
    this.method = method;
  }
}

export class ValidationError extends ApiError {
  errors: string[];

  constructor({ errors, cause }: { errors: string[]; cause?: unknown }) {
    super({ status: 400, cause, message: 'Validation error occurred' });
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
      message: 'No attempts left. Please request a new code'
    });
  }
}
export class CodeRateLimitError extends CodeError {
  allowedAt: Date;

  constructor({ allowedAt }: { allowedAt: Date }) {
    super({
      status: 429,
      message: 'Please wait before requesting a new code'
    });
    this.allowedAt = allowedAt;
  }
}
export class CodeNotFoundOrExpiredError extends CodeError {
  constructor() {
    super({
      status: 404,
      message: 'Verification code not found or expired'
    });
  }
}
export class CodeIncorrectError extends CodeError {
  attemptsLeft: number;

  constructor({ attemptsLeft }: { attemptsLeft: number }) {
    super({
      status: 400,
      message: `Verification code incorrect. Attempts left: ${attemptsLeft}`
    });
    this.attemptsLeft = attemptsLeft;
  }
}
