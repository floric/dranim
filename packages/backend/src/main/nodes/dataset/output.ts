import {
  allAreDefinedAndPresent,
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DatasetRef,
  DataType,
  OutputResult,
  ServerNodeDef
} from '@masterthesis/shared';

export const DatasetOutputNode: ServerNodeDef<
  DatasetOutputNodeInputs,
  {},
  {},
  OutputResult<DatasetRef>
> = {
  type: DatasetOutputNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {
        dataset: { content: { schema: [] }, isPresent: false }
      };
    }

    return inputs;
  },
  onNodeExecution: async (form, inputs) => ({
    outputs: {},
    results: {
      name: '',
      value: inputs.dataset,
      type: DataType.DATASET,
      dashboardId: '',
      description: ''
    }
  })
};
