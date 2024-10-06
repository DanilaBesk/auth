import { JsonSyntaxError, UnexpectedError } from '#/errors/classes.errors';
import { NextFunction, Request, Response, json } from 'express';

export const JsonParseMiddleware = (...args: Parameters<typeof json>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    json(...args)(req, res, (error) => {
      if (error) {
        if (error instanceof Error) {
          return next(new JsonSyntaxError({ message: error.message }));
        }
        return next(new UnexpectedError(error));
      }
      next();
    });
  };
};
