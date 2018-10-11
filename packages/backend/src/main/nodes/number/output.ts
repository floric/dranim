import {
  DataType,
  NodeOutputResult,
  NumberOutputNodeDef,
  NumberOutputNodeInputs,
  OutputNodeForm,
  ServerNodeDef
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';

export const NumberOutputNode: ServerNodeDef<
  NumberOutputNodeInputs,
  {},
  OutputNodeForm,
  NodeOutputResult<number>
> = {
  type: NumberOutputNodeDef.type,
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: async (form, inputs) => {
    console.log(inputs);
    return {
      outputs: {},
      results: {
        name: form.name!,
        value: inputs.value,
        type: DataType.NUMBER,
        description: form.description || ''
      }
    };
  }
};
