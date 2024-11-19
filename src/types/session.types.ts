import { TIpdata } from '#/providers/ipdata.provider';

export type TSession = {
  tokenSignature: string;
  ip: string;
  ua: string;
  createdAt: number;
};

export type TGetUserSessionsKey = {
  userId: string;
};

export type TCreateSession = {
  userId: string;
  sessionId: string;
  tokenSignature: string;
  ip: string;
  ua: string;
};

export type TGetSession = {
  userId: string;
  sessionId: string;
};

export type TGetAllUserSessions = {
  userId: string;
};

export type TDeleteSession = {
  userId: string;
  sessionId: string;
};

export type TDeleteAllUserSessions = {
  userId: string;
};

export type TGetUserSessionsInfo = {
  sessions: Record<string, TSession>;
};

export type TSessionInfo = {
  sessionId: string;
  ip: string;
  ipData: TIpdata | null;
  ua: string;
  createdAt: number;
};
