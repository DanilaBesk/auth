import { UserController } from '#/controllers';
import { Router } from 'express';

const userRouter = Router();

userRouter.post(
  '/request-activation-code',
  UserController.createActivationRecord
);
userRouter.delete('/', UserController.deleteUser);

export { userRouter };
