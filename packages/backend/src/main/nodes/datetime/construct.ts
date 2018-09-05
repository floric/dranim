import {
  allAreDefinedAndPresent,
  DatetimeConstructNodeDef,
  DatetimeConstructNodeInputs,
  DatetimeInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const DatetimeConstructNode: ServerNodeDef<
  DatetimeConstructNodeInputs,
  DatetimeInputNodeOutputs
> = {
  type: DatetimeConstructNodeDef.type,
  isInputValid: async inputs => {
    if (
      !Number.isInteger(inputs.day) ||
      !Number.isInteger(inputs.month) ||
      !Number.isInteger(inputs.year) ||
      !Number.isInteger(inputs.hours) ||
      !Number.isInteger(inputs.minutes) ||
      !Number.isInteger(inputs.seconds)
    ) {
      return false;
    }

    return true;
  },
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
  onNodeExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        value: new Date(
          Date.UTC(
            values.year,
            values.month - 1,
            values.day,
            values.hours,
            values.minutes,
            values.seconds
          )
        )
      }
    })
};
