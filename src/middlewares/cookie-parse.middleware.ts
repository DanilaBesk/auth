import { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { CookieSyntaxError } from '#/errors/classes.errors';
import { UnexpectedError } from '#/errors/common-classes.errors';

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
