import { z } from 'zod';
import { UnionToIntersection } from '#/types/general-utils';

export type FlattenSchemaTypes<T extends z.ZodTypeAny> = UnionToIntersection<
  z.infer<T>[keyof z.infer<T>]
>;
