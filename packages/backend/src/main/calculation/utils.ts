export const getCreatedDatasetName = (nodeName: string) => {
  const randomVal = Math.floor(Math.random() * 100000);
  return `${nodeName}-${randomVal}`;
};
