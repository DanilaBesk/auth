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
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ status: 400, message, cause });
  }
}

export class UnauthorizedError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 401, message });
  }
}

export class ForbiddenError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 403, message });
  }
}

export class NotFoundError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 404, message });
  }
}

export class ConflictError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 409, message });
  }
}

export class ContentTooLargeError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 413, message });
  }
}

export class ExpiredError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 419, message });
  }
}

export class TooManyRequestsError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 429, message });
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor({ message }: { message: string }) {
    super({ status: 503, message });
  }
}
