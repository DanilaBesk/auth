import { NextFunction, Request, Response } from 'express';

import { BaseController } from '#/controllers';
import { TokenService, UserService } from '#/services';
import {
  CreateActivationRecordSchema,
  DeleteUserSchema
} from '#/schemas/user.schemas';

export class UserController extends BaseController {
  static async createActivationRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        body: { email },
        ip
      } = await super.validateRequestData({
        schema: CreateActivationRecordSchema,
        req
      });

      await UserService.createActivationRecord({ email, ip });
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
