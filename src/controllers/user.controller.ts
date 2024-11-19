import { NextFunction, Request, Response } from 'express';

import {
  ChangeEmailSchema,
  ChangePasswordSchema,
  DeleteUserSchema,
  RequestEmailChangeCodeSchema,
  RequestUserDeletionCodeSchema,
  SetPasswordSchema,
  UpdateUserInfoSchema
} from '#/schemas/user.schemas';
import { UserService } from '#/services';
import { validateRequestData } from '#/utils/validate-request-data';

export class UserController {
  static async getUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId, sessionId } = req.accessTokenPayload!;

      const { user } = await UserService.getUserInfo({
        userId,
        sessionId
      });

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { firstName, lastName }
      } = await validateRequestData({
        schema: UpdateUserInfoSchema,
        req
      });

      const userId = req.accessTokenPayload!.sub;

      await UserService.updateUserInfo({
        userId,
        firstName,
        lastName
      });

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  static async requestEmailChangeCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requestTime = new Date();

      const {
        body: { newEmail },
        ip
      } = await validateRequestData({
        schema: RequestEmailChangeCodeSchema,
        req
      });

      const userId = req.accessTokenPayload!.sub;

      await UserService.requestEmailChangeCode({
        userId,
        newEmail,
        ip,
        requestTime
      });

      return res.status(200).json({
        message:
          'A verification code has been sent to the provided email address'
      });
    } catch (error) {
      next(error);
    }
  }

  static async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { newEmail, code }
      } = await validateRequestData({
        schema: ChangeEmailSchema,
        req
      });

      const userId = req.accessTokenPayload!.sub;

      await UserService.changeEmail({
        userId,
        newEmail,
        code
      });

      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { currentPassword, newPassword, signOutOtherSessions }
      } = await validateRequestData({
        schema: ChangePasswordSchema,
        req
      });

      const { sub: userId, sessionId: refreshSessionId } =
        req.accessTokenPayload!;

      await UserService.changePassword({
        userId,
        sessionId: refreshSessionId,
        currentPassword,
        newPassword,
        signOutOtherSessions
      });

      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  static async setPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { newPassword, signOutOtherSessions }
      } = await validateRequestData({
        schema: SetPasswordSchema,
        req
      });

      const { sub: userId, sessionId: refreshSessionId } =
        req.accessTokenPayload!;

      await UserService.setPassword({
        userId,
        sessionId: refreshSessionId,
        newPassword,
        signOutOtherSessions
      });

      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  static async requestUserDeletionCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requestTime = new Date();

      const { ip } = await validateRequestData({
        schema: RequestUserDeletionCodeSchema,
        req
      });

      const userId = req.accessTokenPayload!.sub;

      await UserService.requestUserDeletionCode({
        userId,
        ip,
        requestTime
      });

      return res.status(200).json({
        message:
          'A verification code has been sent to the provided email address'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { code }
      } = await validateRequestData({
        schema: DeleteUserSchema,
        req
      });

      const userId = req.accessTokenPayload!.sub;

      await UserService.deleteUser({
        userId,
        code
      });

      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  static async uploadUserAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.accessTokenPayload!.sub;
      const avatarTempFilepath = req.file!.path;

      const { avatarUrl } = await UserService.uploadUserAvatar({
        userId,
        avatarTempFilepath
      });

      res.status(201).json({ avatarUrl });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUserAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.accessTokenPayload!.sub;

      const { avatarUrl } = await UserService.deleteUserAvatar({ userId });

      res.status(200).json({ avatarUrl });
    } catch (error) {
      next(error);
    }
  }
}
