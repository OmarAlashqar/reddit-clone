import { FieldError } from "../generated/graphql";

// in: [{field: 'a', message: 'a-m'}, ...]
// out: {a: 'a-m', ...}
export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};

  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};
