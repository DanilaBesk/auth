import { Role } from '@prisma/client';

export const ACTIVATION_CODE_LENGTH = 6;
export const ACTIVATION_CODE_EXPIRE_IN = 60 * 5;
export const ACTIVATION_CODE_ATTEMPTS_LIMIT = 3;
export const ACTIVATION_CODE_REQUEST_INTERVAL_SECONDS = 60;

export const CHANGE_EMAIL_CODE_LENGTH = 6;

export const CHANGE_PASSWORD_CODE_LENGTH = 6;

export const INITIAL_USER_ROLE = Role.USER;

export const USER_DELETION_TIMEOUT_HOURS = 24;
