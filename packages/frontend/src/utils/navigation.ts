export const goUp = (url: string) => {
  const segments = url.split('/');
  return segments.slice(0, segments.length - 1).join('/');
};
