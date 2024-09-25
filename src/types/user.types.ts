import { z } from 'zod';
import { User } from '@prisma/client';

import { CreateActivationRecordSchema } from '#/schemas/user.schemas';
import { TRegistration } from '#/types/auth.types';
import { TAccessTokenData } from '#/types/token.types';

export type TGetUserActivationKey = Pick<User, 'email'>;

export type TCreateUser = Pick<User, 'email' | 'password' | 'role'>;

export type TFindUserByEmail = Pick<User, 'email'>;

export type TFindUserById = Pick<User, 'id'>;

export type TActivationRecord = {
  code: string;
  attempts: number;
  createdAt: number;
};

type TCreateActivationRecordSchema = z.infer<
  typeof CreateActivationRecordSchema
>;
export type TCreateActivationRecord = {
  ip: TCreateActivationRecordSchema['ip'];
} & TCreateActivationRecordSchema['body'];

export type TVerifyActivationCode = Pick<TRegistration, 'email' | 'code'>;

export type TDeleteUser = Pick<TAccessTokenData, 'userId' | 'refreshSessionId'>;
