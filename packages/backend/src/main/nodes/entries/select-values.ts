import {
  ApolloContext,
  Dataset,
  Entry,
  SelectValuesNodeDef,
  SelectValuesNodeForm,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  ServerNodeDef,
  Values
} from '@masterthesis/shared';

import {
  addValueSchema,
  createDataset,
  tryGetDataset
} from '../../../main/workspace/dataset';
import { createDynamicDatasetName } from '../../calculation/utils';
import { createEntry } from '../../workspace/entry';
import { processEntries } from './utils';

export const SelectValuesNode: ServerNodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeForm
> = {
  type: SelectValuesNodeDef.type,
  isFormValid: form => Promise.resolve(!!form.values && form.values.length > 0),
  onMetaExecution: async (form, inputs) => {
    if (!form.values || form.values.length === 0) {
      return { dataset: { isPresent: false, content: { schema: [] } } };
    }

    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return { dataset: { isPresent: false, content: { schema: [] } } };
    }

    return {
      dataset: {
        content: {
          schema: inputs.dataset.content.schema.filter(s =>
            form.values!.includes(s.name)
          )
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (
    form,
    inputs,
    { reqContext, node: { workspaceId, id } }
  ) => {
    const existingDs = await tryGetDataset(
      inputs.dataset.datasetId,
      reqContext
    );
    const schemasOnDs = existingDs!.valueschemas.map(n => n.name);
    const unknownValues = form.values!.filter(n => !schemasOnDs.includes(n));
    if (unknownValues.length > 0) {
      throw new Error('Unknown value specified');
    }

    const usedValues = new Set(form.values!);
    const newDs = await createDataset(
      createDynamicDatasetName(SelectValuesNodeDef.type, id),
      reqContext,
      workspaceId
    );

    await filterSchema(existingDs, newDs, usedValues, reqContext);
    await copyTransformedToOtherDataset(
      existingDs.id,
      newDs.id,
      id,
      entry => {
        const newValues = {};
        usedValues.forEach(u => {
          newValues[u] = entry.values[u];
        });

        return newValues;
      },
      reqContext
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

const filterSchema = (
  existingDs: Dataset,
  newDs: Dataset,
  usedValues: Set<string>,
  reqContext: ApolloContext
) =>
  Promise.all(
    existingDs!.valueschemas
      .filter(s => usedValues.has(s.name))
      .map(s => addValueSchema(newDs.id, s, reqContext))
  );

const copyTransformedToOtherDataset = async (
  oldDsId: string,
  newDsId: string,
  nodeId: string,
  transformFn: (obj: Entry) => Values,
  reqContext: ApolloContext
) => {
  processEntries(
    oldDsId,
    nodeId,
    async doc => {
      const newValues = transformFn(doc);
      await createEntry(newDsId, newValues, reqContext);
    },
    reqContext
  );
};
