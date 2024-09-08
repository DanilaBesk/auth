import {
  LoginSchema,
  LogoutSchema,
  RefreshTokensSchema,
  RegistrationSchema,
  CreateActivationRecordSchema
} from '#/schemas/user.schemas';
import { FlattenSchemaTypes } from '#/types/zod-utils.types';
import { User } from '@prisma/client';
import { z } from 'zod';

export type TGetUserById = Pick<User, 'id'>;

export type TCreateUser = Pick<
  FlattenSchemaTypes<typeof RegistrationSchema>,
  'email' | 'password'
>;

type TRegistrationSchema = z.infer<typeof RegistrationSchema>;
export type TRegistration = TRegistrationSchema['body'] & {
  ip: TRegistrationSchema['ip'];
  ua: TRegistrationSchema['headers']['user-agent'];
};

type TLoginSchema = z.infer<typeof LoginSchema>;
export type TLogin = TLoginSchema['body'] & {
  ip: TLoginSchema['ip'];
  ua: TLoginSchema['headers']['user-agent'];
};

export type TLogout = FlattenSchemaTypes<typeof LogoutSchema>;

type TRefreshTokenSchema = z.infer<typeof RefreshTokensSchema>;
export type TRefreshTokens = TRefreshTokenSchema['body'] &
  TRefreshTokenSchema['cookie'] & {
    ip: TRefreshTokenSchema['ip'];
    ua: TRefreshTokenSchema['headers']['user-agent'];
  };

export type TCreateActivationRecord = FlattenSchemaTypes<
  typeof CreateActivationRecordSchema
>;
