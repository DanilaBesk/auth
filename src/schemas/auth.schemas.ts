import { z } from 'zod';
import { capitalizeFirstLetter } from '#/utils/string-utils';
import { FlattenSchemaTypes } from '#/types/zod-types';

function createValidationOptions(fieldName: string, expectedType: string) {
  return {
    required_error: capitalizeFirstLetter(`${fieldName} is required`),
    invalid_type_error: capitalizeFirstLetter(
      `${fieldName} must be of ${expectedType} type`
    )
  };
}

export const EMAIL = z
  .string(createValidationOptions('email', 'string'))
  .email('Invalid email address');

export const PASSWORD = z
  .string(createValidationOptions('password', 'string'))
  .min(8, 'Password must be 8 or more characters long')
  .max(20, 'Password must be 20 or fewer characters long');

export const ACCESS_TOKEN = z.string(
  createValidationOptions('access token', 'string')
);

export const REFRESH_TOKEN = z
  .string(createValidationOptions('refresh token', 'string'))
  .uuid('Invalid refresh token');

export const USER_AGENT = z.string(
  createValidationOptions('user-agent', 'string')
);

export const FINGERPRINT = z.string(
  createValidationOptions('fingerprint', 'string')
);

export const USER_ID = z
  .string(createValidationOptions('user id', 'string'))
  .uuid('Invalid user id');

export const ACTIVATION_CODE = z
  .number(createValidationOptions('activation code', 'number'))
  .refine(
    (num) => Number.isInteger(num) && num >= 100000 && num <= 999999,
    'Invalid activation code'
  );

export const RegistrationSchema = z.object({
  body: z.object({
    email: EMAIL,
    password: PASSWORD,
    code: ACTIVATION_CODE,
    fingerprint: FINGERPRINT,
    ua: USER_AGENT
  })
});
export type TRegistration = FlattenSchemaTypes<typeof RegistrationSchema>;
export type TVerifyActivationCode = Pick<TRegistration, 'email' | 'code'>;

export const LoginSchema = z.object({
  body: z.object({
    email: EMAIL,
    password: PASSWORD,
    fingerprint: FINGERPRINT,
    ua: USER_AGENT
  })
});
export type TLogin = FlattenSchemaTypes<typeof LoginSchema>;

export const LogoutSchema = z.object({
  cookie: z.object({
    refreshToken: REFRESH_TOKEN
  })
});
export type TLogout = FlattenSchemaTypes<typeof LogoutSchema>;

export const RefreshTokensSchema = z.object({
  cookie: z.object({
    refreshToken: REFRESH_TOKEN
  }),
  body: z.object({
    fingerprint: FINGERPRINT
  })
});
export type TRefreshTokens = FlattenSchemaTypes<typeof RefreshTokensSchema>;

export const SendActivationCodeSchema = z.object({
  body: z.object({
    email: EMAIL
  })
});
export type TSendActivationCode = FlattenSchemaTypes<
  typeof SendActivationCodeSchema
>;

/*

registration: checkActivationCode (service) , registr(service)
login
logout: logout(service)
activationCode: activationCode (service) - занос в таблицу или уменьшение попыток

можно запросить 3 разных кода активации, у каждого будет 4 попытки угадать
*/
