import {
  allAreDefinedAndPresent,
  DatetimeCompareNodeDef,
  DatetimeCompareNodeInputs,
  DatetimeCompareNodeOutputs,
  ServerNodeDef,
  TimeComparisonNodeForm,
  TimeComparisonType
} from '@masterthesis/shared';

export const compareTime = async (form, inputs) => {
  const { type } = form;
  if (type === TimeComparisonType.EARLIER_THAN) {
    return {
      outputs: { value: inputs.a.getTime() < inputs.b.getTime() }
    };
  } else if (type === TimeComparisonType.LATER_THAN) {
    return {
      outputs: { value: inputs.a.getTime() > inputs.b.getTime() }
    };
  }

  return {
    outputs: { value: inputs.a.getTime() === inputs.b.getTime() }
  };
};

export const DatetimeCompareNode: ServerNodeDef<
  DatetimeCompareNodeInputs,
  DatetimeCompareNodeOutputs,
  TimeComparisonNodeForm
> = {
  type: DatetimeCompareNodeDef.type,
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
  onNodeExecution: compareTime
};
