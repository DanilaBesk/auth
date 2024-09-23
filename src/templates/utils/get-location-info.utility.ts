import { TIpdata } from '#/providers/ipdata.provider';

export const getLocationInfo = (ipData: TIpdata | null) => {
  if (!ipData) {
    return 'информация о местоположении недоступна';
  }

  const { city, country_name, country_code, emoji_flag } = ipData;

  let locationInfo = `${country_code} (${country_name}) (${emoji_flag})`;

  if (city) {
    locationInfo = `${city}, ${locationInfo}`;
  }

  return locationInfo;
};
