import { z } from 'zod';

import { ApiError } from '@/lib/errors/api-error';

export const validateSchema = <TOutput>(
  schema: z.Schema<TOutput>,
  data: unknown
): TOutput => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw ApiError.ZodValidationError(result.error);
  }
  return result.data;
};
