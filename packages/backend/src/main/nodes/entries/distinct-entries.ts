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

    const usedCombinations = getDistinctHashMap(
      distinctSchemas!,
      inputs.dataset.entries
    );

    let i = 0;
    const entries: Array<Values> = [];

    for (const m of usedCombinations) {
      const res = await contextFnExecution!(
        getContextArguments(m.distinctValues, {
          entries: m.filteredEntries,
          schema: inputs.dataset.schema
        })
      );
      entries.push(res.outputs);

      await updateNodeProgressWithSleep(
        i,
        usedCombinations.length,
        id,
        reqContext
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

const getContextArguments = (
  fieldValues: Values,
  filteredDataset: DatasetRef
) => {
  const args: { [name: string]: any } = {};
  Object.entries(fieldValues).forEach(
    field => (args[getDistinctValueName(field[0])] = field[1])
  );
  args.filteredDataset = filteredDataset;
  return args;
};

const getDistinctHashMap = (
  distinctSchemas: Array<ValueSchema>,
  entries: Array<Values>
) => {
  const assignmentsMap: Map<
    string,
    {
      filteredEntries: Array<Values>;
      distinctValues: Values;
    }
  > = new Map();
  const names = distinctSchemas.map(n => n.name);

  for (const e of entries) {
    const combinationKey = names.map(n => e[n]).join('+');
    let matches = assignmentsMap.get(combinationKey);
    if (!matches) {
      matches = {
        filteredEntries: [],
        distinctValues: {}
      };
      names.forEach(n => (matches!.distinctValues[n] = e[n]));
    }

    assignmentsMap.set(combinationKey, {
      ...matches,
      filteredEntries: [...matches.filteredEntries, e]
    });
  }

  return Array.from(assignmentsMap.values());
};
