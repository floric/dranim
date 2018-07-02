import {
  allAreDefinedAndPresent,
  BooleanOperatorInputs,
  BooleanOperatorOutputs,
  OrNodeDef,
  ServerNodeDef
} from '@masterthesis/shared';

export const OrNode: ServerNodeDef<
  BooleanOperatorInputs,
  BooleanOperatorOutputs
> = {
  type: OrNodeDef.type,
  onMetaExecution: async (form, inputs) => {
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
