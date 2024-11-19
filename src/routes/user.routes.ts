import { Router } from 'express';

import {
  CheckAccessTokenMiddleware,
  FileUploadMiddleware
} from '#/middlewares';
import { UserController } from '#/controllers';
import {
  AVATAR_MAX_FILE_SIZE,
  AVATAR_FILE_EXTENSION,
  AVATAR_ALLOWED_EXTENSIONS,
  AVATARS_TEMP_FOLDER
} from '#/constants/avatar.constants';

const userRouter = Router();

const avatarFileUpload = FileUploadMiddleware({
  limits: { fileSize: AVATAR_MAX_FILE_SIZE, fields: 1, files: 1 },
  allowedExtensions: AVATAR_ALLOWED_EXTENSIONS,
  fileExtension: AVATAR_FILE_EXTENSION,
  tempFolderPath: AVATARS_TEMP_FOLDER
});

userRouter.get('/info', CheckAccessTokenMiddleware, UserController.getUserInfo);
userRouter.post(
  '/update',
  CheckAccessTokenMiddleware,
  UserController.updateUserInfo
);

userRouter.post(
  '/delete/request-code',
  CheckAccessTokenMiddleware,
  UserController.requestUserDeletionCode
);
userRouter.post(
  '/delete',
  CheckAccessTokenMiddleware,
  UserController.deleteUser
);

userRouter.post(
  '/change-email/request-code',
  CheckAccessTokenMiddleware,
  UserController.requestEmailChangeCode
);
userRouter.post(
  '/change-email',
  CheckAccessTokenMiddleware,
  UserController.changeEmail
);

userRouter.post(
  '/change-password',
  CheckAccessTokenMiddleware,
  UserController.changePassword
);
userRouter.post(
  '/set-password',
  CheckAccessTokenMiddleware,
  UserController.setPassword
);

userRouter.post(
  '/avatar/upload',
  CheckAccessTokenMiddleware,
  avatarFileUpload.single('avatarImage'),
  UserController.uploadUserAvatar
);
userRouter.post(
  '/avatar/delete',
  CheckAccessTokenMiddleware,
  UserController.deleteUserAvatar
);

export { userRouter };
