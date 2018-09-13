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
    if (
      !allAreDefinedAndPresent(inputs) ||
      !form.distinctSchemas ||
      form.distinctSchemas.length === 0 ||
      !form.addedSchemas
    ) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return {
      dataset: {
        content: {
          schema: [
            ...form.distinctSchemas.map(s => ({
              ...s,
              name: getDistinctValueName(s)
            })),
            ...form.addedSchemas!
          ]
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (form, inputs) => {
    return {
      outputs: {
        dataset: {
          entries: [],
          schema: inputs.dataset.schema
        }
      }
    };
  }
};
