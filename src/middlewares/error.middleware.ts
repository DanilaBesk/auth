/* eslint-disable no-console */

import { NextFunction, Request, Response } from 'express';

import {
  ApiError,
  TokenExpiredError,
  UnexpectedError,
  ValidationError,
  CodeError,
  CodeIncorrectError,
  CodeRateLimitError,
  OAuthError,
  FileError,
  FileExtensionError,
  FileLimitError
} from '#/errors/classes.errors';
import { CONFIG } from '#config';
import { Prisma } from '@prisma/client';

const isPrismaError = (error: unknown): boolean => {
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
  const defaultMessage = 'Something went wrong. Please try again later.';
  const defaultName = 'InternalError';

  let status = defaultStatus;
  const body: Record<string, unknown> = {
    name: defaultName,
    message: defaultMessage
  };

  if (error instanceof ApiError) {
    status = error.status;
    body.message = error.message;
    body.name = error.name;
    if (error instanceof ValidationError) {
      body.errors = error.errors;
    } else if (error instanceof CodeError) {
      if (error instanceof CodeIncorrectError) {
        body.attemptsLeft = error.attemptsLeft;
      } else if (error instanceof CodeRateLimitError) {
        body.allowedAt = error.allowedAt.getTime();
        res.setHeader('Retry-After', error.allowedAt.toString());
      }
    } else if (error instanceof TokenExpiredError) {
      body.expiredAt = error.expiredAt.getTime();
    } else if (error instanceof OAuthError) {
      body.strategy = error.strategy;
    } else if (error instanceof FileError) {
      if (error instanceof FileExtensionError) {
        body.allowedExtensions = error.allowedExtensions;
      } else if (error instanceof FileLimitError) {
        res.setHeader('Max-File-Size', error.maxFileBytes);
        body.maxFileBytes = error.maxFileBytes;
      }
    }
  } else if (error instanceof UnexpectedError || isPrismaError(error)) {
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
