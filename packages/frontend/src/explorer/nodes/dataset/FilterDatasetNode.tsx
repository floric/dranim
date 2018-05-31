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
  onClientExecution: inputs => {
    return {
      dataset: inputs.dataset
    };
  },
  renderFormItems: ({ inputs: { dataset } }) => {
    if (!dataset.isPresent) {
      return <p>Plugin a dataset first</p>;
    }

    return <p>Test</p>;
  }
};
