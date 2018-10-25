import {
  DataType,
  NodeOutputResult,
  OutputNodeForm,
  ServerNodeDefWithContextFn,
  SocketState,
  SoundChartDef,
  VisInputs
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { getDynamicEntryContextInputs } from '../entries/utils';

interface ContextResult {
  source: string;
  destination: string;
  fromWestToEast: boolean;
  sortingValue: number;
  value: number;
}

interface CityStat {
  isWest: boolean;
  importVolume: number;
  exportVolume: number;
  sortingValue: number;
}

export const SoundChartNode: ServerNodeDefWithContextFn<
  VisInputs,
  {},
  OutputNodeForm,
  NodeOutputResult<{}>,
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
      sortingValue: {
        dataType: DataType.NUMBER,
        displayName: 'Sorting Value',
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
  onNodeExecution: async (form, inputs, { contextFnExecution }) => {
    const cities: Map<string, CityStat> = new Map();

    const passages: Array<{
      source: string;
      destination: string;
      value: number;
      isEastPassage: boolean;
    }> = [];

    for (const e of inputs.dataset.entries) {
      const result = await contextFnExecution!(e);

      aggregateCities(cities, result.outputs);

      passages.push({
        source: result.outputs.source,
        destination: result.outputs.destination,
        value: result.outputs.value,
        isEastPassage: result.outputs.fromWestToEast
      });
    }

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
    importVolume: source.importVolume,
    sortingValue: result.sortingValue
  });
  cities.set(result.destination, {
    isWest: destination.isWest,
    exportVolume: destination.exportVolume,
    importVolume: destination.importVolume + result.value,
    sortingValue: result.sortingValue
  });
};

const getCity = (
  name: string,
  isWest: boolean,
  cities: Map<string, CityStat>
) => {
  let currentValue: CityStat;
  if (!cities.has(name)) {
    currentValue = {
      isWest,
      exportVolume: 0,
      importVolume: 0,
      sortingValue: 0
    };
    cities.set(name, currentValue);
  } else {
    currentValue = cities.get(name)!;
  }
  return currentValue;
};
