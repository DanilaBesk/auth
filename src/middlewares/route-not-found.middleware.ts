import { RouteNotFoundError } from '#/errors/classes.errors';
import { NextFunction, Request, Response } from 'express';

export function RouteNotFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next(new RouteNotFoundError());
}
