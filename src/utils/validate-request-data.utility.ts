import { Request } from 'express';
import { z } from 'zod';

import { ValidationError } from '#/errors/classes.errors';

export const validateRequestData = async <T extends z.AnyZodObject>({
  schema,
  req
}: {
  schema: T;
  req: Request;
}): Promise<z.infer<T>> => {
  const result = await schema.safeParseAsync(req);

  if (!result.success) {
    throw new ValidationError({
      errors: result.error.issues.map((issue) => issue.message),
      cause: result.error
    });
  }

  return result.data;
};
