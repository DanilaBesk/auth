export type TCheckPassword = {
  password: string;
  passwordHash: string;
};

export type TMakeHashPassword = {
  password: string;
};

export type TRegistration = {
  email: string;
  password: string;
  code: string;
  fingerprint: string;
  ip: string;
  ua: string;
};

export type TLogin = {
  email: string;
  password: string;
  fingerprint: string;
  ip: string;
  ua: string;
};

export type TLogout = {
  userId: string;
  refreshSessionId: string;
};

export type TLogoutAll = {
  userId: string;
  refreshSessionId: string;
};

export type TLogoutAllExceptCurrent = {
  userId: string;
  refreshSessionId: string;
};

export type TRefreshTokens = {
  userId: string;
  refreshSessionId: string;
  tokenSignature: string;
  ip: string;
  ua: string;
  fingerprint: string;
};
