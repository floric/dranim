import {
  allAreDefinedAndPresent,
  DatetimeConstructNodeDef,
  DatetimeConstructNodeInputs,
  DatetimeInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';
import moment from 'moment';

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
        value: moment({
          date: values.day,
          month: values.month,
          year: values.year,
          hour: values.hours,
          minute: values.minutes,
          second: values.seconds
        })
      }
    })
};
