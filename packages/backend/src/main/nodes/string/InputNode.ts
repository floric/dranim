import {
  ServerNodeDef,
  StringInputNodeDef,
  StringInputNodeForm,
  StringInputNodeOutputs
} from '@masterthesis/shared';

import { absentMeta, presentMeta } from '../all-nodes';

export const StringInputNode: ServerNodeDef<
  {},
  StringInputNodeOutputs,
  StringInputNodeForm
> = {
  name: StringInputNodeDef.name,
  onMetaExecution: async form => {
    if (form.value === undefined || form.value === null) {
      return {
        string: absentMeta
      };
    }

    return {
      string: presentMeta
    };
  },
  onServerExecution: async form => {
    return {
      outputs: {
        string: form.value || ''
      }
    };
  }
};
