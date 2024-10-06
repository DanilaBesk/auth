import { Role } from '@prisma/client';

export type TCreateUser = {
  email: string;
  password: string;
  role: Role;
};

export type TFindUserByEmail = {
  email: string;
};

export type TFindUserById = {
  userId: string;
};

export type TGetUserActivationRecordKey = {
  email: string;
};

export type TGetEmailChangeRecordKey = {
  userId: string;
};

export type TGetUserDeletionRecordKey = {
  userId: string;
};

export type TRequestUserActivationCode = {
  email: string;
  ip: string;
  requestTime: Date;
};

export type TVerifyUserActivationCode = {
  email: string;
  code: string;
};

export type TRequestEmailChangeCode = {
  userId: string;
  newEmail: string;
  ip: string;
  requestTime: Date;
};

export type TChangeEmailWithCodeVerification = {
  userId: string;
  newEmail: string;
  code: string;
};

export type TRequestUserDeletionCode = {
  userId: string;
  ip: string;
  requestTime: Date;
};

export type TDeleteUserWithCodeVerification = {
  userId: string;
  code: string;
};
