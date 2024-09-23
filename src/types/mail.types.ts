import { TIpdata } from '#/providers/ipdata.provider';

type TSendMailCode = {
  toEmail: string;
  requestIp: string;
  requestIpData: TIpdata;
  requestTime: Date;
  code: string;
};

export type TSendActivationCode = TSendMailCode;

export type TSendResetPasswordCode = TSendMailCode;

export type TSendChangeEmailCode = TSendMailCode;
