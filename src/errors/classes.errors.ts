import {
  ApiError,
  BadRequestError,
  ConflictError,
  ContentTooLargeError,
  ExpiredError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError
} from '#/errors/common-classes.errors';
import { TOAuthSignUpAttemptRequiredFields } from '#/types/auth.types';
import { TToken } from '#/types/token.types';
import { capitalizeFirstLetter } from '#/utils/capitalize-first-letter.utility';

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

export class OAuthError extends ApiError {}

export class OAuthAttemptError extends BadRequestError {
  constructor() {
    super({
      message:
        'An error occurred while processing the 5 request. Please start the process again.'
    });
  }
}

export class OAuthSignInAttemptNotFoundOrExpiredError extends NotFoundError {
  constructor() {
    super({
      message: 'Sign in attempt not found or expired.'
    });
  }
}

export class OAuthSignUpAttemptNotFoundOrExpiredError extends NotFoundError {
  constructor() {
    super({
      message: 'Sign up attempt not found or expired.'
    });
  }
}

export class TOAuthSignUpAttemptRequiredDataError extends BadRequestError {
  requiredFields: TOAuthSignUpAttemptRequiredFields[]; // обязательные поля для данной попытки
  codeRequired?: boolean;

  constructor({
    requiredFields,
    codeRequired
  }: {
    requiredFields: TOAuthSignUpAttemptRequiredFields[];
    codeRequired?: boolean;
  }) {
    super({
      message: 'To continue sign up, please provide the required data.'
    });

    this.requiredFields = requiredFields;
    this.codeRequired = codeRequired;
  }
}

export class TokenExpiredError extends ExpiredError {
  expiredAt: Date;

  constructor({
    tokenType,
    expiredAt
  }: {
    tokenType: TToken;
    expiredAt: Date;
  }) {
    super({
      message: `${capitalizeFirstLetter(tokenType)} token has expired.`
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

export class CurrentSessionNotFoundOrExpiredError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Refresh session not found or has expired.'
    });
  }
}

export class SessionNotFoundError extends NotFoundError {
  constructor() {
    super({
      message: 'Refresh session not found.'
    });
  }
}

export class CurrentSessionSignatureMismatchError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Invalid refresh session. Wrong token signature.'
    });
  }
}

export class EmailAlreadyTakenError extends ConflictError {
  constructor() {
    super({
      message: 'This email address is taken. Please try another.'
    });
  }
}

export class EmailAlreadyVerifiedError extends ConflictError {
  constructor() {
    super({
      message: 'Email is already verified. No confirmation code is required.'
    });
  }
}

export class EmailNotFoundError extends NotFoundError {
  constructor() {
    super({
      message: 'Email address not found.'
    });
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super({
      message: 'Email or password incorrect.'
    });
  }
}

export class IncorrectPasswordError extends ForbiddenError {
  constructor() {
    super({
      message: 'Password is incorrect. Try again, or use another method.'
    });
  }
}

export class CurrentUserNotFoundError extends UnauthorizedError {
  constructor() {
    super({
      message: 'User not found.'
    });
  }
}

export class PasswordNotSetError extends BadRequestError {
  constructor() {
    super({
      message:
        'No password has been set for this email address. Please try another method.'
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

export class FileError extends ApiError {}

export class FileLimitError extends ContentTooLargeError {
  maxFileBytes: number;

  constructor({ maxFileBytes }: { maxFileBytes: number }) {
    super({
      message:
        'File size exceeds the maximum limit. Please upload a smaller file.'
    });
    this.maxFileBytes = maxFileBytes;
  }
}

export class FileExtensionError extends BadRequestError {
  allowedExtensions: string[];

  constructor({ allowedExtensions }: { allowedExtensions: string[] }) {
    super({
      message:
        'Invalid or undefined file extension. Please ensure the file is a valid file format.'
    });
    this.allowedExtensions = allowedExtensions;
  }
}

export class RouteNotFoundError extends NotFoundError {
  constructor() {
    super({
      message: '404 - not found.'
    });
  }
}

export class ValidationError extends BadRequestError {
  errors: unknown[];

  constructor({ errors, cause }: { errors: unknown[]; cause?: unknown }) {
    super({ message: 'Validation error occurred.', cause });

    this.errors = errors;
  }
}

export class CodeMaxAttemptsExceededError extends TooManyRequestsError {
  constructor() {
    super({
      message: 'No attempts left. Please request a new code.'
    });
  }
}

export class CodeRateLimitError extends TooManyRequestsError {
  allowedAt: Date;

  constructor({ allowedAt }: { allowedAt: Date }) {
    super({
      message: 'Please wait before requesting a new code.'
    });
    this.allowedAt = allowedAt;
  }
}

export class CodeNotFoundOrExpiredError extends NotFoundError {
  constructor() {
    super({
      message: 'Verification code not found or expired.'
    });
  }
}

export class CodeIncorrectError extends BadRequestError {
  attemptsLeft: number;

  constructor({ attemptsLeft }: { attemptsLeft: number }) {
    super({
      message: `Verification code is incorrect. Attempts left: ${attemptsLeft}.`
    });
    this.attemptsLeft = attemptsLeft;
  }
}
