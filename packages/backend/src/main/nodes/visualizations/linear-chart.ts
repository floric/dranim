import {
  DataType,
  LinearChartDef,
  LinearChartForm,
  LinearChartType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDefWithContextFn,
  SocketState,
  VisInputs
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { getDynamicEntryContextInputs } from '../entries/utils';

interface ValueLabelAssignment {
  value: number;
  label: string;
}

export const LinearChartNode: ServerNodeDefWithContextFn<
  VisInputs,
  {},
  OutputNodeForm & LinearChartForm,
  OutputResult<{
    type: LinearChartType;
    values: Array<ValueLabelAssignment>;
  }>,
  ValueLabelAssignment
> = {
  type: LinearChartDef.type,
  isFormValid: async form =>
    (await isOutputFormValid(form)) &&
    Object.values(LinearChartType).includes(form.type),
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  transformContextInputDefsToContextOutputDefs: () =>
    Promise.resolve({
      label: {
        dataType: DataType.STRING,
        displayName: 'Label',
        state: SocketState.STATIC
      },
      value: {
        dataType: DataType.NUMBER,
        displayName: 'Value',
        state: SocketState.STATIC
      }
    }),
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: async (
    form,
    inputs,
    { node: { workspaceId }, contextFnExecution }
  ) => {
    const values: Array<ValueLabelAssignment> = [];

    for (const e of inputs.dataset.entries) {
      const res = await contextFnExecution!(e);
      values.push(res.outputs);
    }

    return {
      outputs: {},
      results: {
        value: {
          type: form.type || LinearChartType.COLUMN,
          values
        },
        type: DataType.VIS,
        name: form.name!,
        workspaceId,
        description: form.description || ''
      }
    };
  }
};
