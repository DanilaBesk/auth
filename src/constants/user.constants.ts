import { Role } from '@prisma/client';

export const ACTIVATION_CODE_LENGTH = 6;
export const ACTIVATION_CODE_EXPIRATION_TIME_SECONDS = 60 * 5;
export const ACTIVATION_CODE_ATTEMPTS_LIMIT = 3;
export const ACTIVATION_CODE_REQUEST_INTERVALS_SECONDS: Record<number, number> =
  {
    1: 0,
    2: 60,
    3: 2 * 60,
    4: 5 * 60
  };
export const ACTIVATION_CODE_RESET_TTL_SECONDS = 2 * 60 * 60;

export const CHANGE_EMAIL_CODE_LENGTH = 6;

export const CHANGE_PASSWORD_CODE_LENGTH = 6;

export const INITIAL_USER_ROLE = Role.USER;

export const USER_DELETION_TIMEOUT_HOURS = 24;
