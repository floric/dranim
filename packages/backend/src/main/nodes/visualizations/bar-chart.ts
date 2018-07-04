import {
  allAreDefinedAndPresent,
  DataType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDefWithContextFn,
  VisBarChartDef,
  VisBarChartForm,
  VisBarChartType,
  VisInputs
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { processEntries } from '../entries/utils';

interface ValueLabelAssignment {
  value: number;
  label: string;
}

export const VisBarChartNode: ServerNodeDefWithContextFn<
  VisInputs,
  {},
  OutputNodeForm & VisBarChartForm,
  OutputResult<{
    type: VisBarChartType;
    values: Array<ValueLabelAssignment>;
  }>,
  ValueLabelAssignment
> = {
  type: VisBarChartDef.type,
  isFormValid: isOutputFormValid,
  transformInputDefsToContextInputDefs: async (inputDefs, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {};
    }

    const dynInputDefs = {};
    inputs.dataset.content.schema.forEach(s => {
      dynInputDefs[s.name] = {
        dataType: s.type,
        displayName: s.name,
        isDynamic: true
      };
    });

    return dynInputDefs;
  },
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
          type: form.type || VisBarChartType.COLUMN,
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
