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
export class DataBaseError extends ApiError {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ status: 500, message, cause });
  }
}
export class InternalError extends ApiError {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ status: 500, message, cause });
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
  constructor({
    status = 400,
    message,
    cause
  }: {
    status: number;
    message: string;
    cause?: unknown;
  }) {
    super({ status, message, cause });
  }
}
export class ActivationMaxAttemptsExceededError extends ActivationError {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ status: 429, message, cause });
  }
}
export class ActivationRateLimitError extends ActivationError {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ status: 403, message, cause });
  }
}
