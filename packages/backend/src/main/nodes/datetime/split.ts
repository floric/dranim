import {
  DatetimeConstructNodeInputs,
  DatetimeInputNodeOutputs,
  DatetimeSplitNodeDef,
  ServerNodeDef
} from '@masterthesis/shared';

export const DatetimeSplitNode: ServerNodeDef<
  DatetimeInputNodeOutputs,
  DatetimeConstructNodeInputs
> = {
  type: DatetimeSplitNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (inputs.value == null || !inputs.value.isPresent) {
      return {
        time: { content: {}, isPresent: false },
        day: { content: {}, isPresent: false },
        month: { content: {}, isPresent: false },
        year: { content: {}, isPresent: false }
      };
    }

    return {
      time: { content: {}, isPresent: true },
      day: { content: {}, isPresent: true },
      month: { content: {}, isPresent: true },
      year: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {
        time: new Date(
          Date.UTC(
            0,
            0,
            0,
            inputs.value.getUTCHours(),
            inputs.value.getUTCMinutes(),
            inputs.value.getUTCSeconds()
          )
        ),
        day: inputs.value.getUTCDay(),
        month: inputs.value.getUTCMonth(),
        year: inputs.value.getUTCFullYear()
      }
    })
};
