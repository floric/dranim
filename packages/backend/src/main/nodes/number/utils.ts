export const validateNumber = (val: any) => {
  if (val === null || Number.isNaN(val)) {
    return false;
  }

  return true;
};
