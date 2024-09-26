import { NextFunction, Request, Response } from 'express';

import { BaseController } from '#/controllers';
import { TokenService, UserService } from '#/services';
import {
  RequestActivationCodeSchema,
  DeleteUserSchema
} from '#/schemas/user.schemas';

export class UserController extends BaseController {
  static async requestActivationCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        body: { email },
        ip
      } = await super.validateRequestData({
        schema: RequestActivationCodeSchema,
        req
      });

      await UserService.requestActivationCode({ email, ip });
      return res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  }
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        headers: { authorization: accessToken }
      } = await super.validateRequestData({
        schema: DeleteUserSchema,
        req
      });

      const {
        payload: { sub: userId, refreshSessionId }
      } = await TokenService.verifyAccessToken({
        accessToken
      });

      await UserService.deleteUser({ userId, refreshSessionId });
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}
