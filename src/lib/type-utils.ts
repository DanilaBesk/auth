import { z } from 'zod';

export type UnionToIntersection<U> = (
  U extends any ? (_: U) => void : never
) extends (_: infer I) => void
  ? I
  : never;

export type FlattenSchemaTypes<T extends z.ZodTypeAny> = UnionToIntersection<
  z.infer<T>[keyof z.infer<T>]
>;
