import { TIpdata } from '#/providers/ipdata.provider';

export type TSendActionCode = {
  email: string;
  code: string;
  requestIp: string;
  requestIpData: TIpdata | null;
  requestTime: Date;
};
export type TSend = {
  email: string;
  subject: string;
  html: string;
  text: string;
};

export type TTemplateActionCode = TSendActionCode;
