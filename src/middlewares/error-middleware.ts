import { NextFunction, Request, Response } from 'express';

import { ApiError } from '#/errors/api-error';

export function ErrorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Internal Error', error });
}
