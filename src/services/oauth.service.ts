import axios from 'axios';
import { OAuthProviderName } from '@prisma/client';

import { CLIENT_URL } from '#config';
import { OAuthError } from '#/errors/classes.errors';
import { TGetProviderUserData, TProviderUserData } from '#/types/oauth.types';
import { TokenService } from '#/services/token.service';
import {
  ServiceUnavailableError,
  UnexpectedError
} from '#/errors/common-classes.errors';
import { PROVIDERS } from '#/constants/oauth.constants';

export class OAuthService {
  static async getProviderUserData({
    providerName,
    code,
    codeVerifier
  }: TGetProviderUserData): Promise<TProviderUserData> {
    try {
      const provider = PROVIDERS[providerName];

      const tokenSearchParams = new URLSearchParams();

      tokenSearchParams.set('client_id', provider.clientId);
      tokenSearchParams.set('client_secret', provider.clientSecret);
      tokenSearchParams.set('code', code);
      tokenSearchParams.set('code_verifier', codeVerifier);

      if (providerName !== 'github') {
        tokenSearchParams.set('grant_type', 'authorization_code');
      }
      if (providerName !== 'yandex') {
        tokenSearchParams.set(
          'redirect_uri',
          `${CLIENT_URL}/auth/oauth-callback?providerName=${providerName}`
        );
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

      if (providerName === 'google') {
        const idToken = tokenResponse.data.id_token;

        const decodedIdToken = TokenService.decodeTokenToJson({
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

        const authorizationType =
          providerName === 'yandex' ? 'OAuth' : 'Bearer';
        const acceptType =
          providerName === 'github'
            ? 'application/vnd.github.v3+json'
            : 'application/json';

        const userDataResponse = await axios.get(provider.userDataUrl, {
          headers: {
            Authorization: `${authorizationType} ${accessToken}`,
            Accept: acceptType
          }
        });

        if (providerName === 'yandex') {
          return {
            providerUserId: userDataResponse.data.id,
            email: userDataResponse.data.default_email,
            emailVerified: true,
            firstName: userDataResponse.data.first_name,
            lastName: userDataResponse.data.last_name,
            userName: userDataResponse.data.login,
            avatarUrl: `https://avatars.yandex.net/get-yapic/${userDataResponse.data.default_avatar_id}/islands-200`
          };
        } else if (providerName === 'github') {
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
        `Invalid strategy. Expected one of: ${Object.values(OAuthProviderName).join(',')}, received: ${providerName}.`
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status >= 400 && status <= 499) {
          throw new OAuthError({
            status,
            message: 'Authentication failed with the OAuth provider.'
          });
        } else {
          throw new ServiceUnavailableError({
            message: 'Authentication failed with the OAuth provider.'
          });
        }
      } else if (error instanceof Error) {
        throw new UnexpectedError(error);
      }
      throw error;
    }
  }
}
