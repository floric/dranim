export const validateNonEmptyString = (val: any) => {
  if (!val) {
    return false;
  }

  return true;
};
