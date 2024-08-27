import { ZodError } from 'zod';

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, message: string, errors: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message: string, errors: string[] = []) {
    return new ApiError(400, message, errors);
  }
  static UnauthorizedError(errors: string[]) {
    return new ApiError(401, 'Unauthorized Error', errors);
  }
  static ValidationError(error: ZodError) {
    const errors = error.errors?.map((err) => err.message);
    return new ApiError(400, 'Validation Error', errors);
  }
}
