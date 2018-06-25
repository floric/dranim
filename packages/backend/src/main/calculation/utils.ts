import { validateNonEmptyString } from '../nodes/string/utils';

export const createDynamicDatasetName = (nodeName: string, nodeId: string) => {
  return `${nodeName}-${nodeId}`;
};

export const isOutputFormValid = (form: {
  name: string | null;
  description: string | null;
}) => Promise.resolve(validateNonEmptyString(form.name));
