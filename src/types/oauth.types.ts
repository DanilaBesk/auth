import { z } from 'zod';
import { OAUTH_STRATEGY } from '#/schemas/common.schemas';

export type TOAuthProviderConstants = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
  userDataUrl: string;
};

export type TOAuthStrategy = z.infer<typeof OAUTH_STRATEGY>;

export type TProviderUserData = {
  providerUserId: string;
  email?: string;
  emailVerified?: boolean;
  userName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export type TGetOAuthUrl = {
  state: string;
  strategy: TOAuthStrategy;
};
