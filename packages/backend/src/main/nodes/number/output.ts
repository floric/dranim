import {
  DataType,
  NumberOutputNodeDef,
  NumberOutputNodeInputs,
  OutputNodeForm,
  OutputResult,
  ServerNodeDef
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';

export const NumberOutputNode: ServerNodeDef<
  NumberOutputNodeInputs,
  {},
  OutputNodeForm,
  OutputResult<number>
> = {
  type: NumberOutputNodeDef.type,
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.value,
        type: DataType.NUMBER
      }
    })
};
