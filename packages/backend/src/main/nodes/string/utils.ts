export const validateNonEmptyString = (value: any) => {
  if (!value) {
    return false;
  }

  return true;
};
