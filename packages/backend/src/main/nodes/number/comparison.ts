import {
  allAreDefinedAndPresent,
  ComparisonNodeDef,
  ComparisonNodeForm,
  ComparisonNodeInputs,
  ComparisonNodeOutputs,
  ComparisonType,
  ServerNodeDef
} from '@masterthesis/shared';

export const ComparisonNode: ServerNodeDef<
  ComparisonNodeInputs,
  ComparisonNodeOutputs,
  ComparisonNodeForm
> = {
  type: ComparisonNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {
        value: { content: {}, isPresent: false }
      };
    }

    return {
      value: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: async (form, inputs) => {
    const type = form.type || ComparisonType.EQUALS;

    if (type === ComparisonType.EQUALS) {
      return {
        outputs: {
          value: inputs.a === inputs.b
        }
      };
    } else if (type === ComparisonType.GREATER_THEN) {
      return {
        outputs: {
          value: inputs.a > inputs.b
        }
      };
    } else {
      return {
        outputs: {
          value: inputs.a < inputs.b
        }
      };
    }
  }
};
