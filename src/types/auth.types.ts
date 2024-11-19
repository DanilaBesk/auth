import { z } from 'zod';

import { OAuthSignUpAttemptSchema } from '#/schemas/auth.schemas';
import { TProviderUserData } from '#/types/oauth.types';
import { TUserDataReturned } from '#/types/user.types';
import { OAuthProvider, OAuthProviderName, User } from '@prisma/client';

export type TCheckPassword = {
  password: string;
  passwordHash: string;
};

export type TMakeHashPassword = {
  password: string;
};

export type TAuthData = {
  accessToken: string;
  refreshToken: string;
  user: TUserDataReturned;
};

export type TCreateAuthData = {
  user: User;
  providers: OAuthProvider[];
  ip: string;
  ua: string;
};

export type TSignUp = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  code: string;
  ip: string;
  ua: string;
};

export type TSignIn = {
  email: string;
  password: string;
  ip: string;
  ua: string;
};

export type TGetCodeKey = {
  email: string;
};
export type TGetOAuthAttemptKey = {
  attemptId: string;
};

export type TRequestAuthCode = {
  email: string;
  ip: string;
  requestTime: Date;
};
export type TRequestOAuthSignInAttemptCode = {
  attemptId: string;
  ip: string;
  requestTime: Date;
};
export type TRequestOAuthSignUpAttemptCode = {
  attemptId: string;
  email?: string;
  ip: string;
  requestTime: Date;
};

export type TVerifySignInCode = {
  email: string;
  code: string;
  ip: string;
  ua: string;
};

export type TResetPassword = {
  email: string;
  newPassword: string;
  code: string;
  ip: string;
  ua: string;
};

export type TOAuthCallback = {
  code: string;
  codeVerifier: string;
  providerName: OAuthProviderName;
  ip: string;
  ua: string;
};

export type TOAuthCallbackDataReturned =
  | TAuthData
  | ({
      attemptId: string;
      emailVerified: boolean;
    } & (
      | {
          method: 'sign-in';
        }
      | {
          method: 'sign-up';
          missingFields: string[];
        }
    ));

export type TOAuthSignInAttemptRecord = TProviderUserData & {
  email: string;
  providerName: OAuthProviderName;
};

export type TOAuthSignUpAttemptRecord = TProviderUserData & {
  providerName: OAuthProviderName;
};

export type TOAuthSignUpAttemptFieldsData = Omit<
  z.infer<typeof OAuthSignUpAttemptSchema>['body'],
  'code'
>;

export type TOAuthSignUpAttemptRequiredFields =
  keyof TOAuthSignUpAttemptFieldsData;

export type TOAuthSignUpAttempt = {
  attemptId: string;
  code?: string;
  data: TOAuthSignUpAttemptFieldsData;
  ip: string;
  ua: string;
};

export type TOAuthSignInAttempt = {
  attemptId: string;
  code: string;
  ip: string;
  ua: string;
};

export type TSignOutSession = {
  userId: string;
  sessionId: string;
  targetSessionId: string;
};

export type TSignOutAll = {
  userId: string;
  sessionId: string;
};

export type TSignOutAllExceptCurrent = {
  userId: string;
  sessionId: string;
};

export type TRefreshTokens = {
  userId: string;
  sessionId: string;
  tokenSignature: string;
  ip: string;
  ua: string;
};
