import {
  DatetimeInputNodeOutputs,
  DatetimeConstructNodeDef,
  DatetimeConstructNodeInputs,
  ServerNodeDef
} from '@masterthesis/shared';
import { allAreDefinedAndPresent } from '../../calculation/validation';

export const DatetimeConstructNode: ServerNodeDef<
  DatetimeConstructNodeInputs,
  DatetimeInputNodeOutputs
> = {
  type: DatetimeConstructNodeDef.type,
  isInputValid: async inputs => {
    if (
      !Number.isInteger(inputs.day) ||
      !Number.isInteger(inputs.month) ||
      !Number.isInteger(inputs.year)
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
