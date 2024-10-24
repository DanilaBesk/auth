import axios from 'axios';
import { nanoid } from 'nanoid';

import { CONFIG } from '#config';
import { OAuthError, UnexpectedError } from '#/errors/classes.errors';
import {
  TOAuthProviderConstants,
  TOAuthStrategy,
  TProviderUserData
} from '#/types/oauth.types';
import { TokenService } from '#/services/token.service';
import { OAuthStrategy } from '@prisma/client';

export class OAuthService {
  private static getRedirectUri(path: string) {
    return `http://${CONFIG.APP_HOST}:${CONFIG.APP_PORT}${path}`;
  }

  private static providers: Record<TOAuthStrategy, TOAuthProviderConstants> = {
    google: {
      clientId: CONFIG.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: CONFIG.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: this.getRedirectUri(CONFIG.GOOGLE_OAUTH_REDIRECT_PATH),
      scope: 'openid email profile',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userDataUrl: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    github: {
      clientId: CONFIG.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: CONFIG.GITHUB_OAUTH_CLIENT_SECRET,
      redirectUri: this.getRedirectUri(CONFIG.GITHUB_OAUTH_REDIRECT_PATH),
      scope: 'user:email read:user',
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userDataUrl: 'https://api.github.com/user'
    },
    yandex: {
      clientId: CONFIG.YANDEX_OAUTH_CLIENT_ID,
      clientSecret: CONFIG.YANDEX_OAUTH_CLIENT_SECRET,
      redirectUri: this.getRedirectUri(CONFIG.YANDEX_OAUTH_REDIRECT_PATH),
      scope: 'login:email login:info login:avatar',
      authUrl: 'https://oauth.yandex.ru/authorize',
      tokenUrl: 'https://oauth.yandex.ru/token',
      userDataUrl: 'https://login.yandex.ru/info'
    }
  };

  public static getOAuthUrl({ strategy }: { strategy: TOAuthStrategy }) {
    const state = nanoid();

    const provider = this.providers[strategy];

    const authUrl = new URL(provider.authUrl);

    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('client_id', provider.clientId);
    authUrl.searchParams.set('scope', provider.scope);
    authUrl.searchParams.set('redirect_uri', provider.redirectUri);

    if (strategy !== 'github') {
      authUrl.searchParams.set('response_type', 'code');
    }

    return { oauthUrl: authUrl.href, state };
  }

  static async getProviderUserData({
    strategy,
    code
  }: {
    strategy: TOAuthStrategy;
    code: string;
  }): Promise<TProviderUserData> {
    try {
      const provider = this.providers[strategy];

      const tokenSearchParams = new URLSearchParams();

      tokenSearchParams.set('client_id', provider.clientId);
      tokenSearchParams.set('client_secret', provider.clientSecret);
      tokenSearchParams.set('code', code);

      if (strategy !== 'github') {
        tokenSearchParams.set('grant_type', 'authorization_code');
      }
      if (strategy !== 'yandex') {
        tokenSearchParams.set('redirect_uri', provider.redirectUri);
      }

      const tokenResponse = await axios.post(
        provider.tokenUrl,
        tokenSearchParams,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
          }
        }
      );

      if (strategy === 'google') {
        const idToken = tokenResponse.data.id_token;

        const { payload: decodedIdToken } = TokenService.decodeTokenToJson({
          token: idToken
        });

        return {
          providerUserId: decodedIdToken.sub as string,
          email: decodedIdToken.email,
          emailVerified: decodedIdToken.email_verified,
          firstName: decodedIdToken.given_name,
          lastName: decodedIdToken.family_name,
          avatarUrl: decodedIdToken.picture
        };
      } else {
        const accessToken = tokenResponse.data.access_token as string;

        const authorizationType = strategy === 'yandex' ? 'OAuth' : 'Bearer';
        const acceptType =
          strategy === 'github'
            ? 'application/vnd.github.v3+json'
            : 'application/json';

        const userDataResponse = await axios.get(provider.userDataUrl, {
          headers: {
            Authorization: `${authorizationType} ${accessToken}`,
            Accept: acceptType
          }
        });

        if (strategy === 'yandex') {
          return {
            providerUserId: userDataResponse.data.id,
            email: userDataResponse.data.default_email,
            emailVerified: true,
            firstName: userDataResponse.data.first_name,
            lastName: userDataResponse.data.last_name,
            userName: userDataResponse.data.login,
            avatarUrl: `https://avatars.yandex.net/get-yapic/${userDataResponse.data.default_avatar_id}/islands-200`
          };
        } else if (strategy === 'github') {
          const email = userDataResponse.data.email;
          let emailVerified: boolean | undefined = undefined;

          if (email) {
            const emailsResponse = await axios.get(
              'https://api.github.com/user/emails',
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: 'application/vnd.github+json'
                },
                params: {
                  per_page: 100,
                  page: 1
                }
              }
            );
            const emails = emailsResponse.data as {
              email: string;
              primary: boolean;
              verified: boolean;
            }[];

            emailVerified = emails.find(
              (el) => el.email === userDataResponse.data.email
            )?.verified;
          }

          return {
            providerUserId: userDataResponse.data.id.toString(),
            email,
            emailVerified,
            firstName: userDataResponse.data.name,
            userName: userDataResponse.data.login,
            avatarUrl: userDataResponse.data.avatar_url
          };
        }
      }

      throw new UnexpectedError(
        `Invalid strategy. Expected one of: ${Object.values(OAuthStrategy).join(',')}, received: ${strategy}.`
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new OAuthError({
          status: error.response.status,
          message: 'Authentication failed with the OAuth provider.',
          strategy
        });
      } else if (error instanceof Error) {
        throw new UnexpectedError(error);
      }
      throw error;
    }
  }
}
