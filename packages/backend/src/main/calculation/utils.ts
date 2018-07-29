import { FormValues, OutputNodeForm } from '@masterthesis/shared';
import { v4 } from 'uuid';

import { validateNonEmptyString } from '../nodes/string/utils';

export const createUniqueDatasetName = (nodeName: string, nodeId: string) => {
  return `${nodeName}-${nodeId}-${v4()}`;
};

export const isOutputFormValid = (form: FormValues<OutputNodeForm>) =>
  Promise.resolve(validateNonEmptyString(form.name));
