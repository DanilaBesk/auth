import { OAuthProviderName } from '@prisma/client';

export type TProviderConstants = {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  userDataUrl: string;
};

export type TProviderUserData = {
  providerUserId: string;
  email?: string;
  emailVerified?: boolean;
  userName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export type TGetProviderUserData = {
  providerName: OAuthProviderName;
  code: string;
  codeVerifier: string;
};
