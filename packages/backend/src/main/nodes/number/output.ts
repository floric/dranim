import {
  NumberOutputNodeDef,
  NumberOutputNodeInputs,
  NumberOutputNodeResults,
  ServerNodeDef
} from '@masterthesis/shared';

import { validateNumber } from './utils';

export const NumberOutputNode: ServerNodeDef<
  NumberOutputNodeInputs,
  {},
  {},
  NumberOutputNodeResults
> = {
  type: NumberOutputNodeDef.type,
  isInputValid: input => Promise.resolve(validateNumber(input.value)),
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.value
      }
    })
};
