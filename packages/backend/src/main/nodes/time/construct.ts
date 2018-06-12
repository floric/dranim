import {
  TimeInputNodeOutputs,
  TimeConstructNodeDef,
  TimeConstructNodeInputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const TimeConstructNode: ServerNodeDef<
  TimeConstructNodeInputs,
  TimeInputNodeOutputs
> = {
  type: TimeConstructNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.hours === null ||
      inputs.minutes == null ||
      inputs.seconds == null
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
        value: new Date(0, 0, 0, values.hours, values.minutes, values.seconds)
      }
    })
};
