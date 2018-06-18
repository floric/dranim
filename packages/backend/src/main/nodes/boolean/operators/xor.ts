import {
  BooleanOperatorInputs,
  BooleanOperatorOutputs,
  ServerNodeDef,
  XorNodeDef
} from '@masterthesis/shared';

export const XorNode: ServerNodeDef<
  BooleanOperatorInputs,
  BooleanOperatorOutputs
> = {
  type: XorNodeDef.type,
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
        value:
          (inputs.valueA && !inputs.valueB) || (inputs.valueB && !inputs.valueA)
      }
    })
};
