export const CODE_LENGTH = 6;
export const CODE_EXPIRATION_SECONDS = 60 * 5;
export const CODE_MAX_ATTEMPTS = 3;
export const CODE_REQUEST_INTERVALS_SECONDS: Record<number, number> = {
  1: 0,
  2: 30,
  3: 60,
  4: 2 * 60,
  5: 5 * 60
};
export const CODE_RECORD_RESET_TTL_SECONDS = 2 * 60 * 60;
