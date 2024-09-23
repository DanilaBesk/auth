/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';

import {
  ActivationCodeIncorrect,
  ActivationError,
  ActivationMaxAttemptsExceededError,
  ActivationRateLimitError,
  ApiError,
  InvalidPasswordError,
  InvalidUserCredentialsError,
  RouteNotFoundError,
  TokenExpiredError,
  UnexpectedError,
  UserEmailNotFoundError,
  UserIdNotFoundError
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
  let status = 500;

  const defaultMessage = 'Something went wrong. Please try again later';
  const defaultName = 'InternalError';

  const body: Record<string, string | number | string[]> = {
    name: defaultName,
    message: defaultMessage
  };

  if (error instanceof ApiError) {
    status = error.status;
    body.message = error.message;
    body.name = error.name;

    if (error instanceof ActivationError) {
      if (error instanceof ActivationCodeIncorrect) {
        body.attemptsLeft = error.attemptsLeft;
      } else if (
        error instanceof ActivationRateLimitError ||
        error instanceof ActivationMaxAttemptsExceededError
      ) {
        body.secondsUntilNextCode = error.secondsUntilNextCode;
        res.setHeader('Retry-After', error.secondsUntilNextCode.toString());
      }
    } else if (error instanceof TokenExpiredError) {
      body.expiredAt = error.expiredAt.getTime();
    } else if (
      CONFIG.NODE_ENV === 'production' &&
      (error instanceof InvalidPasswordError ||
        error instanceof UserEmailNotFoundError ||
        error instanceof UserIdNotFoundError)
    ) {
      const replacedError = new InvalidUserCredentialsError();
      body.message = replacedError.message;
      body.status = replacedError.status;
      body.name = replacedError.name;
    } else if (error instanceof RouteNotFoundError) {
      body.url = error.url;
    }
  } else if (error instanceof UnexpectedError || isDatabaseError(error)) {
    status = 500;
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
