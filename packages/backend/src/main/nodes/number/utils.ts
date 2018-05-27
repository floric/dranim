import { isNumeric } from '@masterthesis/shared';

export const validateNumber = (val: any) => {
  if (val === null || !isNumeric(val)) {
    return false;
  }

  return true;
};
