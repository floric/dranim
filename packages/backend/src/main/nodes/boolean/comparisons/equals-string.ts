import {
  EqualsStringNodeDef,
  EqualsStringNodeInputs,
  EqualsStringNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { allAreDefinedAndPresent } from '../../../calculation/validation';

export const EqualsStringNode: ServerNodeDef<
  EqualsStringNodeInputs,
  EqualsStringNodeOutputs
> = {
  type: EqualsStringNodeDef.type,
  onMetaExecution: async (form, inputs, db) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {
        equals: {
          content: {},
          isPresent: false
        }
      };
    }

    return {
      equals: {
        content: {},
        isPresent: true
      }
    };
  },
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {
        equals: inputs.valueA === inputs.valueB
      }
    })
};
