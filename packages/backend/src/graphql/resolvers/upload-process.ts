export const UploadProcess = {
  errors: ({ errors }) =>
    Object.keys(errors).map(name => ({
      name,
      message: errors[name].message,
      count: errors[name].count
    }))
};
