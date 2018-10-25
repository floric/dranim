import {
  allAreDefinedAndPresent,
  DatasetRef,
  DataType,
  DistinctEntriesNodeDef,
  DistinctEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDefs,
  SocketState,
  Values,
  ValueSchema
} from '@masterthesis/shared';
import Combinatorics from 'js-combinatorics';
import { updateNodeProgressWithSleep } from './utils';

const getDistinctValueName = (vsName: string) => `${vsName}-distinct`;

export const DistinctEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  DistinctEntriesNodeForm
> = {
  type: DistinctEntriesNodeDef.type,
  isFormValid: async form => {
    if (
      !form.distinctSchemas ||
      !form.addedSchemas ||
      form.distinctSchemas.length === 0
    ) {
      return false;
    }

    return true;
  },
  transformInputDefsToContextInputDefs: async (inputDefs, inputs, form) => {
    if (form.distinctSchemas == null) {
      return {};
    }

    const res: SocketDefs<any> = {};
    form.distinctSchemas.forEach(vs => {
      res[getDistinctValueName(vs.name)] = {
        dataType: vs.type,
        displayName: getDistinctValueName(vs.name),
        state: SocketState.DYNAMIC
      };
    });

    res.filteredDataset = {
      dataType: DataType.DATASET,
      displayName: 'Filtered Table',
      state: SocketState.DYNAMIC
    };

    return res;
  },
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs,
    contextInputs,
    form
  ) => {
    const contextOutputDefs: SocketDefs<any> = {};
    if (form.addedSchemas) {
      form.addedSchemas.forEach(s => {
        contextOutputDefs[s.name] = {
          dataType: s.type,
          displayName: s.name,
          state: SocketState.DYNAMIC
        };
      });
    }
    const { filteredDataset, ...other } = contextInputDefs;
    return { ...other, ...contextOutputDefs };
  },
  onMetaExecution: async (form, inputs) => {
    const { addedSchemas, distinctSchemas } = form;
    if (
      !allAreDefinedAndPresent(inputs) ||
      !distinctSchemas ||
      distinctSchemas.length === 0 ||
      !addedSchemas
    ) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return {
      dataset: {
        content: {
          schema: [
            ...distinctSchemas.map(vs => ({
              ...vs,
              name: getDistinctValueName(vs.name)
            })),
            ...addedSchemas!
          ]
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (
    form,
    inputs,
    { contextFnExecution, node: { id }, reqContext }
  ) => {
    const { distinctSchemas, addedSchemas } = form;

    const distinctValuesArr = getDistinctValuesArr(
      distinctSchemas!,
      inputs.dataset.entries
    );
    const names = distinctValuesArr.map(n => n[0]);
    const entries: Array<Values> = [];
    const permutations = await getPermutations(
      distinctValuesArr.map(n => Array.from(n[1].values()))
    );
    let i = 0;

    for (const distinctE of permutations) {
      const filteredDatasetEntries = getFilteredDataset(
        inputs.dataset.entries,
        distinctE,
        names
      );

      if (filteredDatasetEntries.length > 0) {
        const args = getContextArguments(
          distinctE,
          { entries: filteredDatasetEntries, schema: inputs.dataset.schema },
          names
        );
        const res = await contextFnExecution!(args);
        entries.push(res.outputs);
      }

      await updateNodeProgressWithSleep(
        i,
        permutations.length,
        id,
        reqContext,
        1000
      );
      i++;
    }

    return {
      outputs: {
        dataset: {
          entries,
          schema: [
            ...distinctSchemas!.map(vs => ({
              ...vs,
              name: getDistinctValueName(vs.name)
            })),
            ...addedSchemas!
          ]
        }
      }
    };
  }
};

const getPermutations = (args: Array<Array<string>>) =>
  new Promise<Array<Array<string>>>(resolve => {
    resolve(Combinatorics.cartesianProduct(...args).toArray());
  });

const getContextArguments = (
  distinctE: Array<string>,
  filteredDataset: DatasetRef,
  names: Array<string>
) => {
  const args: { [name: string]: any } = {};
  distinctE.forEach((c, i) => (args[getDistinctValueName(names[i])] = c));
  args.filteredDataset = filteredDataset;
  return args;
};

const getFilteredDataset = (
  entries: Array<Values>,
  distinctE: Array<string>,
  names: Array<string>
): Array<Values> =>
  entries.filter(e => {
    for (let i = 0; i < distinctE.length; i++) {
      const isInEntry = e[names[i]] === distinctE[i];
      if (!isInEntry) {
        return false;
      }
    }

    return true;
  });

const getDistinctValuesArr = (
  distinctSchemas: Array<ValueSchema>,
  entries: Array<Values>
) => {
  const distinctValues: Map<string, Set<string>> = new Map();
  for (const s of distinctSchemas!) {
    distinctValues.set(s.name, new Set());
  }

  for (const e of entries) {
    for (const s of distinctSchemas!) {
      const valueSet = distinctValues.get(s.name)!;
      valueSet.add(e[s.name]);
    }
  }

  return Array.from(distinctValues.entries());
};
