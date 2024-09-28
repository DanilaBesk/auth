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

export type TGetUserActivationKey = {
  email: string;
};

export type TGetUserChangeEmailKey = {
  userId: string;
};

export type TActivationRecord = {
  code: string;
  attempts: number;
  createdAt: number;
  requestCount: number;
};

export type TChangeEmailRecord = {
  code: string;
  attempts: number;
  createdAt: number;
};

export type TRequestActivationCode = {
  email: string;
  ip: string;
};

export type TVerifyActivationCode = {
  email: string;
  code: string;
};

export type TDeleteUser = {
  userId: string;
  refreshSessionId: string;
};
