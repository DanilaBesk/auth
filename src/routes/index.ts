import { Router } from 'express';

import { userRouter } from '#/routes/user.routes';
import { authRouter } from '#/routes/auth.routes';

const router = Router();

router.use('/users', userRouter);
router.use('/auth', authRouter);

export { router };
