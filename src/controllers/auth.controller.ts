import { NextFunction, Request, Response } from 'express';

import { REFRESH_COOKIE_OPTIONS } from '#/constants/auth.constants';
import {
  OAuthCallbackSchema,
  OAuthSignInAttemptSchema,
  OAuthSignUpAttemptSchema,
  RefreshTokensSchema,
  RequestAuthCodeSchema,
  RequestOAuthSignInAttemptCodeSchema,
  RequestOAuthSignUpAttemptCodeSchema,
  ResetPasswordSchema,
  SignInByCodeSchema,
  SignInSchema,
  SignOutSessionSchema,
  SignUpSchema
} from '#/schemas/auth.schemas';
import { AuthService, TokenService } from '#/services';
import { validateRequestData } from '#/utils/validate-request-data';

export class AuthController {
  static async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { firstName, lastName, email, password, code },
        headers: { 'user-agent': ua },
        ip
      } = await validateRequestData({ schema: SignUpSchema, req });

      const { accessToken, refreshToken, user } = await AuthService.signUp({
        firstName,
        lastName,
        email,
        password,
        code,
        ip,
        ua
      });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(201).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  static async requestSignUpCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requestTime = new Date();

      const {
        body: { email },
        ip
      } = await validateRequestData({ schema: RequestAuthCodeSchema, req });

      await AuthService.requestSignUpCode({
        email,
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

  static async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { email, password },
        headers: { 'user-agent': ua },
        ip
      } = await validateRequestData({ schema: SignInSchema, req });

      const { accessToken, refreshToken, user } = await AuthService.signIn({
        email,
        password,
        ua,
        ip
      });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  static async requestSignInCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requestTime = new Date();

      const {
        body: { email },
        ip
      } = await validateRequestData({ schema: RequestAuthCodeSchema, req });

      await AuthService.requestSignInCode({
        email,
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

  static async signInByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { email, code },
        headers: { 'user-agent': ua },
        ip
      } = await validateRequestData({ schema: SignInByCodeSchema, req });

      const { accessToken, refreshToken, user } =
        await AuthService.signInByCode({
          email,
          code,
          ua,
          ip
        });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  static async requestPasswordResetCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requestTime = new Date();

      const {
        body: { email },
        ip
      } = await validateRequestData({ schema: RequestAuthCodeSchema, req });

      await AuthService.requestPasswordResetCode({
        email,
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

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { email, newPassword, code },
        headers: { 'user-agent': ua },
        ip
      } = await validateRequestData({ schema: ResetPasswordSchema, req });

      const { accessToken, refreshToken, user } =
        await AuthService.resetPassword({
          email,
          newPassword,
          code,
          ua,
          ip
        });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  static async oauthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        headers: { 'user-agent': ua },
        body: { code, codeVerifier, providerName },
        ip
      } = await validateRequestData({ schema: OAuthCallbackSchema, req });

      const data = await AuthService.oauthCallback({
        code,
        codeVerifier,
        providerName,
        ip,
        ua
      });

      if ('user' in data) {
        const { accessToken, refreshToken, user } = data;

        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
        res.status(200).json({ accessToken, user });
      } else {
        res.status(200).json(data);
      }
    } catch (error) {
      next(error);
    }
  }

  static async requestOAuthSignUpAttemptCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requestTime = new Date();

      const {
        params: { attemptId },
        body: { email },
        ip
      } = await validateRequestData({
        schema: RequestOAuthSignUpAttemptCodeSchema,
        req
      });

      await AuthService.requestOAuthSignUpAttemptCode({
        attemptId,
        email,
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

  static async oauthSignUpAttempt(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        headers: { 'user-agent': ua },
        body: { code, email, firstName, lastName },
        params: { attemptId },
        ip
      } = await validateRequestData({ schema: OAuthSignUpAttemptSchema, req });

      const { user, accessToken, refreshToken } =
        await AuthService.oauthSignUpAttempt({
          attemptId,
          code,
          data: { email, firstName, lastName },
          ip,
          ua
        });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(201).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  static async requestOAuthSignInAttemptCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requestTime = new Date();

      const {
        params: { attemptId },
        ip
      } = await validateRequestData({
        schema: RequestOAuthSignInAttemptCodeSchema,
        req
      });

      await AuthService.requestOAuthSignInAttemptCode({
        attemptId,
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

  static async oauthSignInAttempt(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        headers: { 'user-agent': ua },
        body: { code },
        params: { attemptId },
        ip
      } = await validateRequestData({ schema: OAuthSignInAttemptSchema, req });

      const { user, accessToken, refreshToken } =
        await AuthService.oauthSignInAttempt({
          attemptId,
          code,
          ip,
          ua
        });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  static async signOutSession(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { sessionId: targetSessionId }
      } = await validateRequestData({ schema: SignOutSessionSchema, req });

      const { sub: userId, sessionId } = req.accessTokenPayload!;

      const { currentDeleted } = await AuthService.signOutSession({
        userId,
        sessionId,
        targetSessionId
      });

      if (currentDeleted) {
        res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      }

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  static async signOutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId, sessionId } = req.accessTokenPayload!;

      await AuthService.signOutAll({
        userId,
        sessionId
      });

      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  static async signOutAllExceptCurrent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sub: userId, sessionId } = req.accessTokenPayload!;

      await AuthService.signOutAllExceptCurrent({
        userId,
        sessionId
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
        headers: { 'user-agent': ua },
        ip
      } = await validateRequestData({ schema: RefreshTokensSchema, req });

      const {
        payload: { sub: userId, sessionId },
        signature: tokenSignature
      } = await TokenService.verifyRefreshToken({ refreshToken });

      const {
        accessToken,
        refreshToken: newRefreshToken,
        user
      } = await AuthService.refreshTokens({
        userId,
        sessionId,
        tokenSignature,
        ua,
        ip
      });

      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }
}
