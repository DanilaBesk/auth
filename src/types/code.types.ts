export type TCodeRecord = {
  code: string;
  attempts: number;
  createdAt: number;
  requestCount: number;
};

export type TGetRecordKey = {
  idKey: string;
};

export type TCreateCode = {
  idKey: string;
};

export type TVerifyCode = {
  idKey: string;
  code: string;
};
