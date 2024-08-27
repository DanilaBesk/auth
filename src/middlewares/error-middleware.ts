import { NextFunction, Request, Response } from 'express';

import { ApiError } from '#/lib/errors/api-error';

export function ErrorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.cookie('refresh', '3dsfjslj23', {
    maxAge: 60,
    path: '/api/auth',
    domain: process.env.CLIENT_URL,
    sameSite: 'none',
    httpOnly: true,
    secure: true,
    expires: new Date()
  });
  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .json({ message: error.message, errors: error.errors });
  }
  return res.status(500).json({ message: 'Internal Error', error });
}
