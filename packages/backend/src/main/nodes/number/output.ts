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
        name: form.name!,
        value: inputs.value,
        type: DataType.NUMBER,
        dashboardId: form.dashboardId!,
        description: form.description || ''
      }
    })
};
