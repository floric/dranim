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
        hours: { content: {}, isPresent: false },
        minutes: { content: {}, isPresent: false },
        seconds: { content: {}, isPresent: false },
        day: { content: {}, isPresent: false },
        month: { content: {}, isPresent: false },
        year: { content: {}, isPresent: false }
      };
    }

    return {
      hours: { content: {}, isPresent: true },
      minutes: { content: {}, isPresent: true },
      seconds: { content: {}, isPresent: true },
      day: { content: {}, isPresent: true },
      month: { content: {}, isPresent: true },
      year: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {
        hours: inputs.value.hour(),
        minutes: inputs.value.minute(),
        seconds: inputs.value.second(),
        day: inputs.value.date(),
        month: inputs.value.month(),
        year: inputs.value.year()
      }
    })
};
