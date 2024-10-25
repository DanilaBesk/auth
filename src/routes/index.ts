import { Router } from 'express';

import { userRouter } from '#/routes/user.routes';
import { authRouter } from '#/routes/auth.routes';
import { avatarRouter } from '#/routes/avatar.routes';

const router = Router();

router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/avatars', avatarRouter);

export { router };
