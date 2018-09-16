import {
  allAreDefinedAndPresent,
  DataType,
  DistinctEntriesNodeDef,
  DistinctEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDefs,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

const getDistinctValueName = (vs: ValueSchema) => `${vs.name}-distinct`;

export const DistinctEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  DistinctEntriesNodeForm,
  {}
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
      return {} as any;
    }

    const res: SocketDefs<any> = {};
    form.distinctSchemas.forEach(ds => {
      res[getDistinctValueName(ds)] = {
        dataType: ds.type,
        displayName: getDistinctValueName(ds),
        state: SocketState.DYNAMIC
      };
    });

    res.filteredDataset = {
      dataType: DataType.DATASET,
      displayName: 'Filtered Dataset',
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
            ...distinctSchemas.map(s => ({
              ...s,
              name: getDistinctValueName(s)
            })),
            ...addedSchemas!
          ]
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (form, inputs) => {
    const { distinctSchemas, addedSchemas } = form;
    const distinctValues: Map<string, Set<string>> = new Map();
    for (const s of distinctSchemas!) {
      distinctValues.set(s.name, new Set());
    }

    for (const e of inputs.dataset.entries) {
      for (const s of distinctSchemas!) {
        const valueSet = distinctValues.get(s.name)!;
        valueSet.add(e[s.name]);
      }
    }

    const iterators: Array<number> = [];
    for (const s of distinctSchemas!) {
      iterators.push(0);
    }

    // TODO FInd lib for aggregation

    return {
      outputs: {
        dataset: {
          entries: [],
          schema: [
            ...distinctSchemas!.map(s => ({
              ...s,
              name: getDistinctValueName(s)
            })),
            ...addedSchemas!
          ]
        }
      }
    };
  }
};
