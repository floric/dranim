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
  onNodeExecution: (form, inputs, { node: { workspaceId } }) =>
    Promise.resolve({
      outputs: {},
      results: {
        name: form.name!,
        value: inputs.value,
        type: DataType.NUMBER,
        description: form.description || ''
      }
    })
};
