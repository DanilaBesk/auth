import { AnyZodObject, z } from 'zod';
import { ValidationError } from '#/lib/errors/api-error';
import { Request } from 'express';

export const validateData = async <T extends AnyZodObject>(
  schema: T,
  req: Request
): Promise<z.infer<T>> => {
  const result = await schema.safeParseAsync(req);

  if (!result.success) {
    throw new ValidationError(result.error);
  }

  return result.data;
};
