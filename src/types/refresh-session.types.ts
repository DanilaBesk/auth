import { TIpdata } from '#/providers/ipdata.provider';

export type TRefreshSession = {
  tokenSignature: string;
  ip: string;
  ua: string;
  createdAt: number;
};

export type TGetRefreshSessionKey = {
  userId: string;
};

export type TAddRefreshSession = {
  userId: string;
  refreshSessionId: string;
  tokenSignature: string;
  ip: string;
  ua: string;
};

export type TGetRefreshSession = {
  userId: string;
  refreshSessionId: string;
};

export type TGetAllUserRefreshSessions = {
  userId: string;
};

export type TDeleteRefreshSession = {
  userId: string;
  refreshSessionId: string;
};

export type TDeleteAllUserRefreshSessions = {
  userId: string;
};

export type TGetRefreshSessionsInfo = {
  refreshSessions: Record<string, TRefreshSession>;
};

export type TRefreshSessionInfo = {
  refreshSessionId: string;
  ip: string;
  ipData: TIpdata | null;
  ua: string;
  createdAt: number;
};
