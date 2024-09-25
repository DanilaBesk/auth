import { z } from 'zod';

import { TAccessTokenData, TRefreshTokenData } from '#/types/token.types';
import {
  LoginSchema,
  RegistrationSchema,
  RefreshTokensSchema
} from '#/schemas/auth.schemas';
import { IP, USER_AGENT_HEADER } from '#/schemas/user.schemas';

type TIp = z.infer<typeof IP>;
type TUa = z.infer<typeof USER_AGENT_HEADER>;

export type TCheckPassword = {
  password: string;
  passwordHash: string;
};

export type TMakeHashPassword = {
  password: string;
};

type TRegistrationSchema = z.infer<typeof RegistrationSchema>;

export type TRegistration = TRegistrationSchema['body'] & {
  ip: TIp;
  ua: TUa;
};

type TLoginSchema = z.infer<typeof LoginSchema>;

export type TLogin = TLoginSchema['body'] & {
  ip: TIp;
  ua: TUa;
};

export type TLogout = Pick<TAccessTokenData, 'userId' | 'refreshSessionId'>;

export type TLogoutAll = Pick<TAccessTokenData, 'userId' | 'refreshSessionId'>;

export type TLogoutAllExceptCurrent = Pick<
  TAccessTokenData,
  'userId' | 'refreshSessionId'
>;

type TRefreshTokenSchema = z.infer<typeof RefreshTokensSchema>;

export type TRefreshTokens = TRefreshTokenSchema['body'] & {
  ip: TIp;
  ua: TUa;
  tokenSignature: string;
} & Pick<TRefreshTokenData, 'userId' | 'refreshSessionId'>;
