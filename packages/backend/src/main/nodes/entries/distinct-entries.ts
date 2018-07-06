import {
  allAreDefinedAndPresent,
  DistinctEntriesNodeDef,
  DistinctEntriesNodeForm,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDefs
} from '@masterthesis/shared';

import { createDynamicDatasetName } from '../../calculation/utils';
import { createDataset } from '../../workspace/dataset';

export const DistinctEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  DistinctEntriesNodeForm,
  {}
> = {
  type: DistinctEntriesNodeDef.type,
  isFormValid: async form => {
    if (!form.schema || !form.newSchemas) {
      return false;
    }

    return true;
  },
  transformInputDefsToContextInputDefs: async (inputDefs, inputs, form) => {
    if (form.schema == null) {
      return {} as any;
    }

    return {
      distinct: {
        dataType: form.schema.type,
        displayName: `${form.schema.name}-distinct`,
        isDynamic: true
      }
    };
  },
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs,
    contextInputs,
    form
  ) => {
    const contextOutputDefs: SocketDefs<any> = {};
    if (form.newSchemas) {
      form.newSchemas.forEach(s => {
        contextOutputDefs[s.name] = {
          dataType: s.type,
          displayName: s.name,
          isDynamic: true
        };
      });
    }
    return { ...contextInputDefs, ...contextOutputDefs };
  },
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return {
      dataset: {
        content: { schema: [form.schema!, ...form.newSchemas!] },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (
    form,
    inputs,
    { reqContext, node: { workspaceId, id } }
  ) => {
    const newDs = await createDataset(
      createDynamicDatasetName(FilterEntriesNodeDef.type, id),
      reqContext,
      workspaceId
    );

    return {
      outputs: {
        dataset: {
          datasetId: newDs.id
        }
      }
    };
  }
};
