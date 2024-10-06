export type TCodeRecord = {
  code: string;
  attempts: number;
  createdAt: number;
  requestCount: number;
};

export type TCreateCodeRecord = {
  recordKey: string;
};

export type TVerifyCodeRecord = {
  recordKey: string;
  code: string;
};
