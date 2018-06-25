import {
  DataType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDef,
  StringOutputNodeDef,
  StringOutputNodeInputs
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';

export const StringOutputNode: ServerNodeDef<
  StringOutputNodeInputs,
  {},
  OutputNodeForm,
  OutputResult<string>
> = {
  type: StringOutputNodeDef.type,
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.value,
        type: DataType.STRING
      }
    })
};
