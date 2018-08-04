import {
  DataType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDefWithContextFn,
  SocketState,
  SoundChartDef,
  VisInputs
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { tryGetDataset } from '../../workspace/dataset';
import { getDynamicEntryContextInputs, processEntries } from '../entries/utils';

interface ContextResult {
  source: string;
  destination: string;
  fromWestToEast: boolean;
  value: number;
}

interface CityStat {
  isWest: boolean;
  importVolume: number;
  exportVolume: number;
}

export const SoundChartNode: ServerNodeDefWithContextFn<
  VisInputs,
  {},
  OutputNodeForm,
  OutputResult<{}>,
  ContextResult
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
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: async (
    form,
    inputs,
    { node: { workspaceId, id }, reqContext, contextFnExecution }
  ) => {
    const ds = await tryGetDataset(inputs.dataset.datasetId, reqContext);

    const cities: Map<string, CityStat> = new Map();

    const passages: Array<{
      source: string;
      destination: string;
      value: number;
      isEastPassage: boolean;
    }> = [];

    await processEntries(
      ds.id,
      id,
      async doc => {
        const result = await contextFnExecution!(doc.values);

        aggregateCities(cities, result.outputs);

        passages.push({
          source: result.outputs.source,
          destination: result.outputs.destination,
          value: result.outputs.value,
          isEastPassage: result.outputs.fromWestToEast
        });
      },
      reqContext
    );

    const east = {};
    Array.from(cities.entries())
      .filter(c => !c[1].isWest)
      .forEach(c => {
        east[c[0]] = c[1];
      });
    const west = {};
    Array.from(cities.entries())
      .filter(c => c[1].isWest)
      .forEach(c => {
        west[c[0]] = c[1];
      });

    return {
      outputs: {},
      results: {
        value: {
          type: SoundChartDef.type,
          values: {
            cities: {
              east,
              west
            },
            passages
          }
        },
        type: DataType.VIS,
        name: form.name!,
        workspaceId,
        description: form.description || ''
      }
    };
  }
};

const aggregateCities = (
  cities: Map<string, CityStat>,
  result: ContextResult
) => {
  const fromWestToEast = JSON.parse(result.fromWestToEast as any);
  const source = getCity(result.source, fromWestToEast, cities);
  const destination = getCity(result.destination, !fromWestToEast, cities);

  cities.set(result.source, {
    isWest: source.isWest,
    exportVolume: result.value + source.exportVolume,
    importVolume: source.importVolume
  });
  cities.set(result.destination, {
    isWest: destination.isWest,
    exportVolume: destination.exportVolume,
    importVolume: destination.importVolume + result.value
  });
};

const getCity = (
  name: string,
  isWest: boolean,
  cities: Map<string, CityStat>
) => {
  let currentValue: {
    isWest: boolean;
    exportVolume: number;
    importVolume: number;
  };
  if (!cities.has(name)) {
    currentValue = {
      isWest,
      exportVolume: 0,
      importVolume: 0
    };
    cities.set(name, currentValue);
  } else {
    currentValue = cities.get(name)!;
  }
  return currentValue;
};
