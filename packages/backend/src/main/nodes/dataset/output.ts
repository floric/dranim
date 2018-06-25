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
  onNodeExecution: async (form, inputs, { db }) => ({
    outputs: {},
    results: { value: inputs.dataset, type: DataType.DATASET }
  })
};
