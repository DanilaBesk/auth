import { ZodIssue } from 'zod';
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string, cause?: unknown) {
    super(message, { cause });
    this.status = status;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, cause?: unknown) {
    super(400, message, cause);
  }
}
export class UnauthorizedError extends ApiError {
  constructor(cause?: unknown) {
    super(401, 'Unauthorized Error', cause);
  }
}
export class DataBaseError extends ApiError {
  constructor(message: string, cause?: unknown) {
    super(500, message, cause);
  }
}
export class InternalError extends ApiError {
  constructor(message: string, cause?: unknown) {
    super(500, message, cause);
  }
}

export class ValidationError extends ApiError {
  errors: ZodIssue[];
  constructor(errors: ZodIssue[], cause?: unknown) {
    super(400, 'Validation Error', cause);
    this.errors = errors;
  }
}
