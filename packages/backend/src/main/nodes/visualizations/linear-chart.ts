import {
  DataType,
  LinearChartDef,
  LinearChartForm,
  LinearChartType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDefWithContextFn,
  VisInputs
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { getDynamicEntryContextInputs, processEntries } from '../entries/utils';

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
      label: { dataType: DataType.STRING, displayName: 'Label' },
      value: { dataType: DataType.NUMBER, displayName: 'Value' }
    }),
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: async (
    form,
    inputs,
    { node: { workspaceId, id }, contextFnExecution, reqContext }
  ) => {
    const values: Array<ValueLabelAssignment> = [];

    if (contextFnExecution) {
      await processEntries(
        inputs.dataset.datasetId,
        id,
        async entry => {
          const res = await contextFnExecution(entry.values);
          values.push(res.outputs);
        },
        reqContext
      );
    } else {
      throw new Error('Missing context function');
    }

    return {
      outputs: {},
      results: {
        value: {
          type: form.type || LinearChartType.COLUMN,
          values
        },
        type: DataType.CUSTOM,
        name: form.name!,
        workspaceId,
        description: form.description || ''
      }
    };
  }
};
