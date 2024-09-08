import { NextFunction, Request, Response } from 'express';
import { RouteNotFoundError } from '#/errors/api-error';

export function RouteNotFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next(new RouteNotFoundError({ url: req.url }));
}
