import fetch from 'node-fetch';
import { LRUCache } from 'lru-cache';

import { CONFIG } from '#config';

export type TIpdata = {
  city: string | null;
  country_name: string;
  country_code: string;
  emoji_flag: string;
};

class IpData {
  private cache: LRUCache<string, TIpdata>;

  constructor() {
    this.cache = new LRUCache<string, TIpdata>({
      max: 5000,
      ttl: 1000 * 60 * 60
    });
  }

  public async getIPData(ip: string): Promise<TIpdata | null> {
    if (this.cache.has(ip)) {
      return this.cache.get(ip) || null;
    }

    try {
      const url = `https://api.ipdata.co/${ip}?api-key=${CONFIG.IP_DATA_KEY}&fields=city,country_name,country_code,emoji_flag`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as TIpdata;

      this.cache.set(ip, data);

      return data;
    } catch (error) {
      return null;
    }
  }
}

export const ipdata = new IpData();
