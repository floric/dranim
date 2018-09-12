import {
  Dataset,
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DataType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDef
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { saveTemporaryDataset, tryGetDataset } from '../../workspace/dataset';

export const DatasetOutputNode: ServerNodeDef<
  DatasetOutputNodeInputs,
  {},
  OutputNodeForm,
  OutputResult<Dataset>
> = {
  type: DatasetOutputNodeDef.type,
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: async (
    form,
    inputs,
    { reqContext, node: { workspaceId } }
  ) => {
    const ds = await tryGetDataset(inputs.dataset.datasetId, reqContext);
    await saveTemporaryDataset(ds.id, form.name!, reqContext);
    return {
      outputs: {},
      results: {
        name: form.name!,
        value: { ...ds, name: form.name! },
        type: DataType.DATASET,
        workspaceId,
        description: form.description || ''
      }
    };
  }
};
