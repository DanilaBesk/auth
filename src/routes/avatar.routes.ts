import { AVATARS_FOLDER } from '#/constants/avatar.constants';
import express, { Router } from 'express';

const avatarRouter = Router();

avatarRouter.use('/', express.static(AVATARS_FOLDER));

export { avatarRouter };
