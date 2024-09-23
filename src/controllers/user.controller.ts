import { NextFunction, Request, Response } from 'express';

import { BaseController } from '#/controllers';
import { UserService } from '#/services';
import { CreateActivationRecordSchema } from '#/schemas/user.schemas';

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
}
