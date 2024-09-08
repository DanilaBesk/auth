import { Request } from 'express';
import { AnyZodObject, z } from 'zod';
import { ValidationError } from '#/errors/api-error';

export const validateData = async <T extends AnyZodObject>(
  schema: T,
  req: Request
): Promise<z.infer<T>> => {
  const result = await schema.safeParseAsync(req);

  if (!result.success) {
    throw new ValidationError({
      errors: result.error.issues.map((issue) => issue.message),
      cause: result.error
    });
  }

  return result.data;
};
