import { FormValues, OutputNodeForm } from '@masterthesis/shared';

import { validateNonEmptyString } from '../nodes/string/utils';

export const createDynamicDatasetName = (nodeName: string, nodeId: string) => {
  return `${nodeName}-${nodeId}`;
};

export const isOutputFormValid = (form: FormValues<OutputNodeForm>) =>
  Promise.resolve(
    validateNonEmptyString(form.name) &&
      validateNonEmptyString(form.dashboardId)
  );
