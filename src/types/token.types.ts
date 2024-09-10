import { User } from '@prisma/client';

export type TUserId = User['id'];
export type TRefreshUUID = string;

export type TAccessPayload = Pick<User, 'role' | 'email'> & { sub: TUserId };

export type TMakeAccessToken = Pick<User, 'email' | 'id' | 'role'>;

export type TRefreshSession = {
  ip: string;
  ua: string;
  fingerprint: string;
  expiresAt: number;
};

export type TAddRefreshSession = {
  userId: TUserId;
  refreshUUID: TRefreshUUID;
} & Omit<TRefreshSession, 'expiresAt'>;

export type TRemoveRefreshSession = {
  userId: TUserId;
  refreshUUID: TRefreshUUID;
};

export type TGetRefreshSession = {
  userId: TUserId;
  refreshUUID: TRefreshUUID;
};

export type TVerifyRefreshSession = {
  oldRefreshSession: TRefreshSession;
  newFingerprint: TRefreshSession['fingerprint'];
};
