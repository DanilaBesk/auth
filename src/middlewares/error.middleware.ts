/* eslint-disable no-console */

import { NextFunction, Request, Response } from 'express';

import { REFRESH_COOKIE_OPTIONS } from '#/constants/auth.constants';
import {
  CodeIncorrectError,
  CodeRateLimitError,
  CurrentSessionNotFoundOrExpiredError,
  CurrentSessionSignatureMismatchError,
  CurrentUserNotFoundError,
  FileExtensionError,
  FileLimitError,
  TOAuthSignUpAttemptRequiredDataError,
  TokenExpiredError,
  ValidationError
} from '#/errors/classes.errors';
import { ApiError, UnexpectedError } from '#/errors/common-classes.errors';
import { CONFIG } from '#config';

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
    } else if (
      error instanceof CurrentSessionNotFoundOrExpiredError ||
      error instanceof CurrentSessionSignatureMismatchError ||
      error instanceof CurrentUserNotFoundError
    ) {
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
    } else if (error instanceof CodeIncorrectError) {
      body.attemptsLeft = error.attemptsLeft;
    } else if (error instanceof CodeRateLimitError) {
      body.allowedAt = error.allowedAt.getTime();
      res.setHeader('Retry-After', error.allowedAt.toString());
    } else if (error instanceof TokenExpiredError) {
      body.expiredAt = error.expiredAt.getTime();
    } else if (error instanceof TOAuthSignUpAttemptRequiredDataError) {
      body.requiredFields = error.requiredFields;
      body.codeRequired = error.codeRequired;
    } else if (error instanceof FileExtensionError) {
      body.allowedExtensions = error.allowedExtensions;
    } else if (error instanceof FileLimitError) {
      body.maxFileBytes = error.maxFileBytes;
      res.setHeader('Max-File-Size', error.maxFileBytes);
    }
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
