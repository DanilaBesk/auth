import { TIpdata } from '#/providers/ipdata.provider';
import { FormattedDateTimeUTC } from '#/templates/utils/formatted-date-time-utc.utility';
import { getLocationInfo } from '#/templates/utils/get-location-info.utility';

export const getIpDataHtml = ({
  ip,
  ipData,
  time
}: {
  ip: string;
  ipData: TIpdata | null;
  time: Date;
}) => {
  const locationInfo = getLocationInfo(ipData);

  const formattedDateTime = new FormattedDateTimeUTC({ time }).toString();

  return `
  <p>Этот код был запрошен от IP: ${ip}, ${locationInfo}, ${formattedDateTime}. Если вы не отправляли этот запрос, вы можете спокойно игнорировать это письмо.</p>
  `;
};

export const getIpDataText = ({
  ip,
  ipData,
  time
}: {
  ip: string;
  ipData: TIpdata | null;
  time: Date;
}) => {
  const locationInfo = getLocationInfo(ipData);

  const formattedDateTime = new FormattedDateTimeUTC({ time }).toString();

  return `Этот код был запрошен от IP: ${ip}, ${locationInfo}, ${formattedDateTime}. Если вы не отправляли этот запрос, вы можете спокойно игнорировать это письмо.`;
};
