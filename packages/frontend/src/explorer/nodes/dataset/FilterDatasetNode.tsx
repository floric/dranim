import * as React from 'react';

import {
  FilterDatasetNodeDef,
  FilterDatasetNodeForm,
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../AllNodes';

export const FilterDatasetNode: ClientNodeDef<
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs,
  FilterDatasetNodeForm
> = {
  name: FilterDatasetNodeDef.name,
  onClientExecution: (inputs, nodeForm, context) => {
    return {
      dataset: inputs.dataset
    };
  },
  renderFormItems: () => <p>TODO</p>
};
