import { capitalizeFirstLetter } from '#/utils/capitalize-first-letter.utility';

export function createValidationOptions(
  fieldName: string,
  expectedType: string
) {
  return {
    required_error: capitalizeFirstLetter(`${fieldName} is required`),
    invalid_type_error: capitalizeFirstLetter(
      `${fieldName} must be of ${expectedType} type`
    )
  };
}
