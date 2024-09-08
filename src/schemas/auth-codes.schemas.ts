import { EMAIL } from '#/schemas/user.schemas';
import { createValidationOptions } from '#/schemas/utils/create-validation-options.utility';
import { z } from 'zod';

export const ACTIVATION_CODE = z
  .number(createValidationOptions('activation code', 'number'))
  .refine(
    (num) => Number.isInteger(num) && num >= 100000 && num <= 999999,
    'Invalid activation code'
  );

export const CreateActivationRecordSchema = z.object({
  body: z.object({
    email: EMAIL
  })
});
