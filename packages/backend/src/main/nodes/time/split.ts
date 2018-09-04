import {
  ServerNodeDef,
  TimeConstructNodeInputs,
  TimeInputNodeOutputs,
  TimeSplitNodeDef
} from '@masterthesis/shared';

export const TimeSplitNode: ServerNodeDef<
  TimeInputNodeOutputs,
  TimeConstructNodeInputs
> = {
  type: TimeSplitNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (inputs.value == null || !inputs.value.isPresent) {
      return {
        hours: { content: {}, isPresent: false },
        minutes: { content: {}, isPresent: false },
        seconds: { content: {}, isPresent: false }
      };
    }

    return {
      hours: { content: {}, isPresent: true },
      minutes: { content: {}, isPresent: true },
      seconds: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {
        hours: inputs.value.hours(),
        minutes: inputs.value.minutes(),
        seconds: inputs.value.seconds()
      }
    })
};
