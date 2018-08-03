import {
  DataType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDefWithContextFn,
  SocketState,
  SoundChartDef,
  VisInputs
} from '@masterthesis/shared';

import { tryGetDataset } from '../../workspace/dataset';
import { getDynamicEntryContextInputs, processEntries } from '../entries/utils';

interface ContextResults {
  source: string;
  destination: string;
  fromWestToEast: boolean;
  value: number;
}

export const SoundChartNode: ServerNodeDefWithContextFn<
  VisInputs,
  {},
  OutputNodeForm,
  OutputResult<{}>,
  ContextResults
> = {
  type: SoundChartDef.type,
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  transformContextInputDefsToContextOutputDefs: () =>
    Promise.resolve({
      source: {
        dataType: DataType.STRING,
        displayName: 'Source',
        state: SocketState.STATIC
      },
      destination: {
        dataType: DataType.STRING,
        displayName: 'Destination',
        state: SocketState.STATIC
      },
      fromWestToEast: {
        dataType: DataType.BOOLEAN,
        displayName: 'Is from West to East',
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
    { node: { workspaceId, id }, reqContext, contextFnExecution }
  ) => {
    const ds = await tryGetDataset(inputs.dataset.datasetId, reqContext);
    const values: Array<{
      source: string;
      destination: string;
      fromWestToEast: boolean;
      value: number;
    }> = [];

    await processEntries(
      ds.id,
      id,
      async doc => {
        const res = await contextFnExecution!(doc.values);
        values.push(res.outputs);
      },
      reqContext
    );

    return {
      outputs: {},
      results: {
        value: {
          type: SoundChartDef.type,
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
