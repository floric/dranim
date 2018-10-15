import {
  BooleanOutputNodeDef,
  BooleanOutputNodeInputs,
  DataType,
  NodeOutputResult,
  OutputNodeForm,
  ServerNodeDef
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';

export const BooleanOutputNode: ServerNodeDef<
  BooleanOutputNodeInputs,
  {},
  OutputNodeForm,
  NodeOutputResult<boolean>
> = {
  type: BooleanOutputNodeDef.type,
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs, { node: { workspaceId } }) =>
    Promise.resolve({
      outputs: {},
      results: {
        name: form.name!,
        value: inputs.value,
        type: DataType.BOOLEAN,
        description: form.description || ''
      }
    })
};
