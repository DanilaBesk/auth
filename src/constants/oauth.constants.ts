import { OAuthProviderName } from '@prisma/client';
import { CONFIG } from '#config';
import { TProviderConstants } from '#/types/oauth.types';

export const PROVIDERS: Record<OAuthProviderName, TProviderConstants> = {
  google: {
    clientId: CONFIG.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: CONFIG.GOOGLE_OAUTH_CLIENT_SECRET,
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userDataUrl: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  github: {
    clientId: CONFIG.GITHUB_OAUTH_CLIENT_ID,
    clientSecret: CONFIG.GITHUB_OAUTH_CLIENT_SECRET,
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userDataUrl: 'https://api.github.com/user'
  },
  yandex: {
    clientId: CONFIG.YANDEX_OAUTH_CLIENT_ID,
    clientSecret: CONFIG.YANDEX_OAUTH_CLIENT_SECRET,
    tokenUrl: 'https://oauth.yandex.ru/token',
    userDataUrl: 'https://login.yandex.ru/info'
  }
};
