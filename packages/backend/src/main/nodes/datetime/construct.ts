import {
  DatetimeInputNodeOutputs,
  DatetimeConstructNodeDef,
  DatetimeConstructNodeInputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const DatetimeConstructNode: ServerNodeDef<
  DatetimeConstructNodeInputs,
  DatetimeInputNodeOutputs
> = {
  type: DatetimeConstructNodeDef.type,
  isInputValid: async inputs => {
    if (
      inputs.day == null ||
      inputs.month == null ||
      inputs.year == null ||
      inputs.time == null
    ) {
      return false;
    }

    if (
      !Number.isInteger(inputs.day) ||
      !Number.isInteger(inputs.month) ||
      !Number.isInteger(inputs.year)
    ) {
      return false;
    }

    // TODO Validate valid date
    return true;
  },
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.day == null ||
      inputs.month == null ||
      inputs.time == null ||
      inputs.year == null ||
      !inputs.day.isPresent ||
      !inputs.month.isPresent ||
      !inputs.year.isPresent ||
      !inputs.time.isPresent
    ) {
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
          values.year,
          values.month,
          values.day,
          values.time.getHours(),
          values.time.getMinutes(),
          values.time.getSeconds()
        )
      }
    })
};
