import {
  BooleanOperatorInputs,
  BooleanOperatorOutputs,
  OrNodeDef,
  ServerNodeDef
} from '@masterthesis/shared';

import { allAreDefinedAndPresent } from '../../../calculation/validation';

export const OrNode: ServerNodeDef<
  BooleanOperatorInputs,
  BooleanOperatorOutputs
> = {
  type: OrNodeDef.type,
  onMetaExecution: async (form, inputs, db) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {
        value: {
          content: {},
          isPresent: false
        }
      };
    }

    return {
      value: {
        content: {},
        isPresent: true
      }
    };
  },
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {
        value: inputs.valueA || inputs.valueB
      }
    })
};
