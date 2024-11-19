import { Router } from 'express';
import { AuthController } from '#/controllers';
import { CheckAccessTokenMiddleware } from '#/middlewares';

const authRouter = Router();

authRouter.post('/sign-up', AuthController.signUp);
authRouter.post('/sign-up/request-code', AuthController.requestSignUpCode);

authRouter.post('/sign-in', AuthController.signIn);

authRouter.post('/sign-in/request-code', AuthController.requestSignInCode);
authRouter.post('/sign-in/verify-code', AuthController.signInByCode);

authRouter.post('/forgot-password', AuthController.requestPasswordResetCode);
authRouter.post('/reset-password', AuthController.resetPassword);

authRouter.post('/oauth/callback', AuthController.oauthCallback);

authRouter.post(
  '/oauth/sign-up/:attemptId/request-code',
  AuthController.requestOAuthSignUpAttemptCode
);
authRouter.post('/oauth/sign-up/:attemptId', AuthController.oauthSignUpAttempt);

authRouter.post(
  '/oauth/sign-in/:attemptId/request-code',
  AuthController.requestOAuthSignInAttemptCode
);
authRouter.post('/oauth/sign-in/:attemptId', AuthController.oauthSignInAttempt);

authRouter.post(
  '/sign-out/all',
  CheckAccessTokenMiddleware,
  AuthController.signOutAll
);
authRouter.post(
  '/sign-out/all-except-current',
  CheckAccessTokenMiddleware,
  AuthController.signOutAllExceptCurrent
);
authRouter.post(
  '/sign-out/:sessionId',
  CheckAccessTokenMiddleware,
  AuthController.signOutSession
);

authRouter.post('/refresh-tokens', AuthController.refreshTokens);

export { authRouter };
