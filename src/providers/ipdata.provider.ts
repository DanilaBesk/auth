import { CONFIG } from '#config';
import IPData from 'ipdata';

export const ipdata = new IPData(CONFIG.IP_DATA_KEY);
