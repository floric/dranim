import {
  allAreDefinedAndPresent,
  ServerNodeDef,
  TimeCompareNodeDef,
  TimeCompareNodeInputs,
  TimeCompareNodeOutputs,
  TimeComparisonNodeForm
} from '@masterthesis/shared';

import { compareTime } from '../datetime';

export const TimeCompareNode: ServerNodeDef<
  TimeCompareNodeInputs,
  TimeCompareNodeOutputs,
  TimeComparisonNodeForm
> = {
  type: TimeCompareNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {
        value: {
          content: {},
          isPresent: false
        }
      };
    }

    return {
      value: {
        content: {},
        isPresent: true
      }
    };
  },
  onNodeExecution: compareTime
};
