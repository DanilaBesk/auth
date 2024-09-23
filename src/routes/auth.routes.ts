import { Router } from 'express';
import { AuthController } from '#/controllers';

const authRouter = Router();

authRouter.post('/register', AuthController.registration);
authRouter.post('/login', AuthController.login);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/logout-all', AuthController.logoutAll);
authRouter.post(
  '/logout-all-except-current',
  AuthController.logoutAllExceptCurrent
);
authRouter.post('/refresh-tokens', AuthController.refreshTokens);

export { authRouter };
