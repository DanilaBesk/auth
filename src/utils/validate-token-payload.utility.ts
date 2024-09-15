import { z } from 'zod';

import { InvalidTokenPayloadError } from '#/errors/classes.errors';
import { TTokenType } from '#/types/token.types';

export const validateTokenPayload = async <T extends z.AnyZodObject>({
  schema,
  payload,
  tokenType
}: {
  schema: T;
  payload: unknown;
  tokenType: TTokenType;
}): Promise<z.infer<T>> => {
  const result = await schema.safeParseAsync(payload);

  if (!result.success) {
    throw new InvalidTokenPayloadError({ tokenType });
  }

  return result.data;
};
