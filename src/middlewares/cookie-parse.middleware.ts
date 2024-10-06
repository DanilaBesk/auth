import { CookieSyntaxError, UnexpectedError } from '#/errors/classes.errors';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';

export const CookieParseMiddleware = (
  ...args: Parameters<typeof cookieParser>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    cookieParser(...args)(req, res, (error) => {
      if (error) {
        if (error instanceof Error) {
          return next(new CookieSyntaxError({ message: error.message }));
        }
        return next(new UnexpectedError(error));
      }
      next();
    });
  };
};
