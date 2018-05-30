import { isNumeric } from '@masterthesis/shared';

export const validateNumber = (value: any) => {
  if (value === null || !isNumeric(value)) {
    return false;
  }

  return true;
};
