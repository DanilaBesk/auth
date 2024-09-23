import { TIpdata } from '#/providers/ipdata.provider';

export const getLocationInfo = ({
  city,
  country_name,
  country_code,
  emoji_flag
}: TIpdata) => {
  let locationInfo = `${country_code} (${country_name}) (${emoji_flag})`;

  if (city) {
    locationInfo = `${city}, ${locationInfo}`;
  }

  return locationInfo;
};
