/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';

import { ApiError } from '#/errors/api-error';
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
  let message = 'Something went wrong...';
  let status = 500;
  let name = 'InternalError';

  if (error instanceof ApiError) {
    status = error.status;
    if (CONFIG.NODE_ENV !== 'production') {
      name = error.name;
      message = error.message;
    } else if (!isDatabaseError(error)) {
      name = error.name;
      message = error.message;
    }
  }
  if (CONFIG.NODE_ENV !== 'production') {
    if (error instanceof ApiError) console.error('Operational error: ', error);
    else console.error('Non-operational error: ', error);
  }

  return res.status(status).json({ message, name });
}
