export const hasErrors = (fieldsError: any) => {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
};
