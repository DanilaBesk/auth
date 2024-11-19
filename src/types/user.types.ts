import { TSessionInfo } from '#/types/session.types';
import { OAuthProvider, OAuthProviderName, User } from '@prisma/client';

export type TFindUserByEmail = {
  email: string;
};

export type TFindUserWithProvidersByEmail = {
  email: string;
};

export type TFindUserWithProvidersById = {
  userId: string;
};

export type TFindUserById = {
  userId: string;
};

export type TUserDataReturned = {
  firstName: string;
  lastName: string;
  email: string;
  hasPassword: boolean;
  hasImage: boolean;
  avatarUrl: string;
  updatedAt: number;
  createdAt: number;
  sessions: TSessionInfo[];
  externalAccounts: {
    id: string;
    providerName: OAuthProviderName;
    linkedAt: number;
  }[];
};

export type TGetUserDataReturned = {
  user: User;
  providers: OAuthProvider[];
  sessionsInfo: TSessionInfo[];
};

export type TGetUserInfo = {
  sessionId: string;
  userId: string;
};

export type TUpdateUserInfo = {
  userId: string;
  firstName: string;
  lastName: string;
};

export type TGetVerifyCodeKey = {
  userId: string;
};

export type TRequestEmailChangeCode = {
  userId: string;
  newEmail: string;
  ip: string;
  requestTime: Date;
};

export type TChangeEmail = {
  userId: string;
  newEmail: string;
  code: string;
};

export type TRequestUserDeletionCode = {
  userId: string;
  ip: string;
  requestTime: Date;
};

export type TDeleteUser = {
  userId: string;
  code: string;
};

export type TChangePassword = {
  userId: string;
  sessionId: string;
  currentPassword: string;
  newPassword: string;
  signOutOtherSessions: boolean;
};

export type TSetPassword = Omit<TChangePassword, 'currentPassword'>;

export type TUploadUserAvatar = {
  userId: string;
  avatarTempFilepath: string;
};

export type TDeleteUserAvatar = {
  userId: string;
};
