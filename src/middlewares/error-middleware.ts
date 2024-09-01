/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';

import {
  ActivationCodeIncorrect,
  ActivationError,
  ActivationMaxAttemptsExceededError,
  ActivationRateLimitError,
  ApiError
} from '#/errors/api-error';
import { Prisma } from '@prisma/client';
import { CONFIG } from '#config';

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

  const defaultMessage = 'Something went wrong...';
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
    }
  } else if (isDatabaseError(error)) {
    status = 500;
    body.name = defaultName;
    body.message = defaultMessage;
  }

  if (CONFIG.NODE_ENV !== 'production') {
    if (error instanceof ApiError) console.error('Operational error: ', error);
    else console.error('Non-operational error: ', error);
  }

  return res.status(status).json(body);
}
