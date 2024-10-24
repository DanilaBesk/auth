import { AuthorizationHeaderSchema } from '#/schemas/auth.schemas';
import { TokenService } from '#/services';
import { TAccessTokenPayload } from '#/types/token.types';
import { validateRequestData } from '#/utils/validate-request-data';
import { NextFunction, Request, Response } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      accessTokenPayload?: TAccessTokenPayload;
    }
  }
}

export const CheckAccessTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      headers: { authorization: accessToken }
    } = await validateRequestData({
      req,
      schema: AuthorizationHeaderSchema
    });

    const { payload } = await TokenService.verifyAccessToken({ accessToken });

    req.accessTokenPayload = payload;
  } catch (error) {
    next(error);
  }
  next();
};
