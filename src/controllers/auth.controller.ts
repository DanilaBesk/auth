import { NextFunction, Request, Response } from 'express';

import { BaseController } from '#/controllers';
import { AuthService, TokenService } from '#/services';
import { REFRESH_COOKIE_OPIONS } from '#/constants/auth.constants';
import {
  RegistrationSchema,
  LoginSchema,
  LogoutSchema,
  LogoutAllExceptCurrentSchema,
  LogoutAllSchema,
  RefreshTokensSchema
} from '#/schemas/auth.schemas';

export class AuthController extends BaseController {
  static async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { email, password, fingerprint, code },
        headers: { 'user-agent': ua },
        ip
      } = await super.validateRequestData({ schema: RegistrationSchema, req });

      const { accessToken, refreshToken } = await AuthService.registration({
        email,
        password,
        code,
        fingerprint,
        ua,
        ip
      });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPIONS);

      res.status(201).json({ accessToken });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { email, password, fingerprint },
        headers: { 'user-agent': ua },
        ip
      } = await super.validateRequestData({ schema: LoginSchema, req });

      const { accessToken, refreshToken } = await AuthService.login({
        email,
        password,
        fingerprint,
        ua,
        ip
      });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPIONS);

      res.status(200).json({ accessToken });
    } catch (error) {
      next(error);
    }
  }
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        headers: { authorization: accessToken }
      } = await super.validateRequestData({ schema: LogoutSchema, req });

      const {
        payload: { sub: userId, refreshSessionId }
      } = await TokenService.verifyAccessToken({
        accessToken
      });

      await AuthService.logout({
        refreshSessionId,
        userId
      });

      res.clearCookie('refreshToken', REFRESH_COOKIE_OPIONS);

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        headers: { authorization: accessToken }
      } = await super.validateRequestData({
        schema: LogoutAllSchema,
        req
      });

      const {
        payload: { sub: userId, refreshSessionId }
      } = await TokenService.verifyAccessToken({
        accessToken
      });

      await AuthService.logoutAll({
        refreshSessionId,
        userId
      });

      res.clearCookie('refreshToken', REFRESH_COOKIE_OPIONS);

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
  static async logoutAllExceptCurrent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        headers: { authorization: accessToken }
      } = await super.validateRequestData({
        schema: LogoutAllExceptCurrentSchema,
        req
      });

      const {
        payload: { sub: userId, refreshSessionId }
      } = await TokenService.verifyAccessToken({
        accessToken
      });

      await AuthService.logoutAllExceptCurrent({
        userId,
        refreshSessionId
      });
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
  static async refreshTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        cookies: { refreshToken },
        body: { fingerprint },
        headers: { 'user-agent': ua },
        ip
      } = await super.validateRequestData({ schema: RefreshTokensSchema, req });

      const {
        payload: { refreshSessionId, sub: userId },
        signature: tokenSignature
      } = await TokenService.verifyRefreshToken({ refreshToken });

      const { accessToken, refreshToken: newRefreshToken } =
        await AuthService.refreshTokens({
          userId,
          refreshSessionId,
          tokenSignature,
          fingerprint,
          ua,
          ip
        });

      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPIONS);

      res.status(200).json({ accessToken });
    } catch (error) {
      next(error);
    }
  }
}
