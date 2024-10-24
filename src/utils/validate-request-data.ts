import { Request } from 'express';
import { z } from 'zod';

import { UnexpectedError, ValidationError } from '#/errors/classes.errors';

type TLocations =
  | 'body'
  | 'headers'
  | 'query'
  | 'ip'
  | 'files'
  | 'file'
  | 'cookies'
  | 'signedCookies';

export const validateRequestData = async <T extends z.ZodType>({
  schema,
  req
}: {
  schema: T;
  req: Request;
}): Promise<z.infer<T>> => {
  const result = await schema.safeParseAsync(req);

  if (!result.success) {
    throw new ValidationError({
      errors: result.error.issues.map((issue) => {
        const code = issue.code;
        const message = issue.message;
        const location = determineLocation(issue.path);

        const errors: {
          code: string;
          message: string;
          location: TLocations;
          path?: (string | number)[];
          field?: string | string[];
          element?: string;
        } = {
          code,
          message,
          location
        };

        if (location === 'body') {
          errors.path = issue.path.slice(1);
        }

        const isRequiredFieldError =
          issue.code === 'invalid_type' &&
          issue.received === 'undefined' &&
          issue.expected !== 'undefined';

        if (isRequiredFieldError) {
          errors.code = 'required_error';
        }

        if (errors.location !== 'ip') {
          const { field, element } = buildField(issue.path);
          errors.field = field;
          if (element) {
            errors.element = element;
          }
        }

        if (code === 'unrecognized_keys') {
          errors.field = issue.keys;
        }

        return errors;
      }),
      cause: result.error
    });
  }

  return result.data;
};

const locationMapping: Record<string, TLocations> = {
  signedCookies: 'cookies',
  body: 'body',
  headers: 'headers',
  query: 'query',
  ip: 'ip',
  cookies: 'cookies',
  file: 'file',
  files: 'files'
};

const determineLocation = (path: (string | number)[]): TLocations => {
  const location = path[0];

  if (typeof location !== 'string') {
    throw new UnexpectedError(
      'Invalid path format: location must be a string.'
    );
  }

  if (location in locationMapping) {
    return locationMapping[location];
  }

  throw new UnexpectedError('Unknown location encountered.');
};

const buildField = (path: (string | number)[]) => {
  let field = '';
  let element = '';

  path.forEach((segment) => {
    if (typeof segment === 'string') {
      field = segment;
      element = segment;
    } else if (typeof segment === 'number') {
      if (!element) {
        throw new UnexpectedError('');
      }
      element += `[${segment}]`;
    }
  });

  if (!field) {
    throw new UnexpectedError('Field cannot be an empty string.');
  }

  return { field, element: element === field ? undefined : element };
};
