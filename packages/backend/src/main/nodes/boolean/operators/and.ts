import {
  AndNodeDef,
  BooleanOperatorInputs,
  BooleanOperatorOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const AndNode: ServerNodeDef<
  BooleanOperatorInputs,
  BooleanOperatorOutputs
> = {
  name: AndNodeDef.name,
  isInputValid: async inputs => {
    if (inputs.valueA == null || inputs.valueB == null) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs, db) => {
    if (
      !inputs.valueA ||
      !inputs.valueB ||
      !inputs.valueA.isPresent ||
      !inputs.valueB.isPresent
    ) {
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
        value: inputs.valueA && inputs.valueB
      }
    })
};
