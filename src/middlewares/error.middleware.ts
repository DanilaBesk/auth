/* eslint-disable no-console */

import { NextFunction, Request, Response } from 'express';

import {
  ActivationCodeIncorrect,
  ActivationError,
  ActivationRateLimitError,
  ApiError,
  InvalidPasswordError,
  InvalidUserCredentialsError,
  RefreshSessionCancellationTimeoutNotReachedError,
  RouteNotFoundError,
  TokenExpiredError,
  UnexpectedError,
  UserEmailNotFoundError,
  UserIdNotFoundError,
  ValidationError
} from '#/errors/classes.errors';
import { CONFIG } from '#config';
import { Prisma } from '@prisma/client';

const isDatabaseError = (error: unknown): boolean => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  );
};
export function ErrorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const defaultStatus = 500;
  const defaultMessage = 'Something went wrong. Please try again later';
  const defaultName = 'InternalError';

  let status = defaultStatus;
  const body: Record<string, string | number | string[]> = {
    name: defaultName,
    message: defaultMessage
  };

  if (error instanceof ApiError) {
    status = error.status;
    body.message = error.message;
    body.name = error.name;
    if (error instanceof ValidationError) {
      body.errors = error.errors;
    } else if (error instanceof ActivationError) {
      if (error instanceof ActivationCodeIncorrect) {
        body.attemptsLeft = error.attemptsLeft;
      } else if (error instanceof ActivationRateLimitError) {
        body.allowedAt = error.allowedAt.getTime();
        res.setHeader('Retry-After', error.allowedAt.toString());
      }
    } else if (error instanceof TokenExpiredError) {
      body.expiredAt = error.expiredAt.getTime();
    } else if (
      error instanceof RefreshSessionCancellationTimeoutNotReachedError
    ) {
      body.allowedAt = error.allowedAt.getTime();
    } else if (
      CONFIG.NODE_ENV === 'production' &&
      (error instanceof InvalidPasswordError ||
        error instanceof UserEmailNotFoundError ||
        error instanceof UserIdNotFoundError)
    ) {
      const replacedError = new InvalidUserCredentialsError();
      body.message = replacedError.message;
      status = replacedError.status;
      body.name = replacedError.name;
    } else if (error instanceof RouteNotFoundError) {
      body.url = error.url;
      body.method = error.method;
    }
  } else if (error instanceof UnexpectedError || isDatabaseError(error)) {
    status = defaultStatus;
    body.name = defaultName;
    body.message = defaultMessage;
  }

  if (CONFIG.NODE_ENV !== 'production') {
    if (error instanceof ApiError) console.error('Operational error: ', error);
    else if (error instanceof UnexpectedError) {
      console.error('Unexpected error: ', error);
    } else {
      console.error('Unknown error: ', error);
    }
  }

  return res.status(status).json(body);
}
