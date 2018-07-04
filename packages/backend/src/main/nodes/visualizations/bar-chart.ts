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

export const VisBarChartNode: ServerNodeDefWithContextFn<
  VisInputs,
  {},
  OutputNodeForm & VisBarChartForm,
  OutputResult<{
    type: VisBarChartType;
    values: Array<{ value: number; label: string }>;
  }>
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
  onNodeExecution: async (form, inputs, { node: { workspaceId } }) => {
    // TODO map values to chart values format

    return {
      outputs: {},
      results: {
        value: {
          type: form.type || VisBarChartType.COLUMN,
          values: [
            { label: 'Big Macs before 2012', value: 192 },
            { label: 'After 2012', value: 19 }
          ]
        },
        type: DataType.CUSTOM,
        name: form.name!,
        workspaceId,
        description: form.description || ''
      }
    };
  }
};
