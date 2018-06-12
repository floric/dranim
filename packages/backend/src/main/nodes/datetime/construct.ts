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
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.day == null ||
      inputs.month == null ||
      inputs.time == null ||
      inputs.year == null
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
          values.time.getUTCHours(),
          values.time.getUTCMinutes(),
          values.time.getUTCSeconds()
        )
      }
    })
};
