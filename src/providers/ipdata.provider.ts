import fetch from 'node-fetch';
import { LRUCache } from 'lru-cache';

import { CONFIG } from '#config';
import { z } from 'zod';

const IpdataSchema = z.object({
  city: z.string().nullable(),
  country_name: z.string(),
  country_code: z.string().length(2),
  emoji_flag: z.string().emoji()
});

export type TIpdata = z.infer<typeof IpdataSchema>;

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

      const json = await response.json();

      const result = await IpdataSchema.safeParseAsync(json);

      if (!result.success) {
        return null;
      }

      this.cache.set(ip, result.data);

      return result.data;
    } catch (error) {
      return null;
    }
  }
}

export const ipdata = new IpData();
