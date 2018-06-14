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
  isInputValid: async inputs => {
    if (
      inputs.seconds == null ||
      inputs.minutes == null ||
      inputs.hours == null
    ) {
      return false;
    }

    if (inputs.seconds < 0 || inputs.seconds > 59) {
      return false;
    }
    if (inputs.minutes < 0 || inputs.minutes > 59) {
      return false;
    }
    if (inputs.hours < 0 || inputs.hours > 23) {
      return false;
    }
    if (
      !Number.isInteger(inputs.hours) ||
      !Number.isInteger(inputs.minutes) ||
      !Number.isInteger(inputs.seconds)
    ) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.hours === null ||
      inputs.minutes == null ||
      inputs.seconds == null ||
      !inputs.hours.isPresent ||
      !inputs.minutes.isPresent ||
      !inputs.seconds.isPresent
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
          Date.UTC(0, 0, 0, values.hours, values.minutes, values.seconds)
        )
      }
    })
};
