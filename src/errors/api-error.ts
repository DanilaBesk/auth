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
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ status: 400, message, cause });
  }
}
export class UnauthorizedError extends ApiError {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ status: 401, message, cause });
  }
}

export class ValidationError extends ApiError {
  errors: string[];
  constructor({ errors, cause }: { errors: string[]; cause?: unknown }) {
    super({ status: 400, cause, message: 'ValidationError' });
    this.errors = errors;
  }
}
export class ActivationError extends ApiError {
  constructor({ status, message }: { status: number; message: string }) {
    super({ status, message });
  }
}
export class ActivationMaxAttemptsExceededError extends ActivationError {
  secondsUntilNextCode: number;

  constructor({ secondsUntilNextCode }: { secondsUntilNextCode: number }) {
    super({
      status: 429,
      message: 'No attempts left, request a new code'
    });
    this.secondsUntilNextCode = secondsUntilNextCode;
  }
}
export class ActivationRateLimitError extends ActivationError {
  secondsUntilNextCode: number;

  constructor({ secondsUntilNextCode }: { secondsUntilNextCode: number }) {
    super({
      status: 429,
      message: `Please wait ${Math.ceil(secondsUntilNextCode)} seconds before requesting a new code`
    });
    this.secondsUntilNextCode = secondsUntilNextCode;
  }
}
export class ActivationCodeNotFoundOrExpired extends ActivationError {
  constructor() {
    super({
      status: 404,
      message: 'Activation code not found or expired'
    });
  }
}
export class ActivationCodeIncorrect extends ActivationError {
  attemptsLeft: number;

  constructor({ attemptsLeft }: { attemptsLeft: number }) {
    super({
      status: 400,
      message: `Incorrect code. Attempts left: ${attemptsLeft}`
    });
    this.attemptsLeft = attemptsLeft;
  }
}
