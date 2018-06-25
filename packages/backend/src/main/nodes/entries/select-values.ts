import {
  Dataset,
  Entry,
  SelectValuesNodeDef,
  SelectValuesNodeForm,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  ServerNodeDef,
  Values
} from '@masterthesis/shared';
import { Db } from 'mongodb';

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
  onNodeExecution: async (form, inputs, { db, node }) => {
    const existingDs = await tryGetDataset(inputs.dataset.datasetId, db);
    const schemasOnDs = existingDs!.valueschemas.map(n => n.name);
    const unknownValues = form.values!.filter(n => !schemasOnDs.includes(n));
    if (unknownValues.length > 0) {
      throw new Error('Unknown value specified');
    }

    const usedValues = new Set(form.values!);
    const newDs = await createDataset(
      db,
      createDynamicDatasetName(SelectValuesNodeDef.type, node.id),
      node.workspaceId
    );

    await filterSchema(existingDs, newDs, usedValues, db);
    await copyTransformedToOtherDataset(
      db,
      existingDs.id,
      newDs.id,
      node.id,
      entry => {
        const newValues = {};
        usedValues.forEach(u => {
          newValues[u] = entry.values[u];
        });

        return newValues;
      }
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
  db: Db
) =>
  Promise.all(
    existingDs!.valueschemas
      .filter(s => usedValues.has(s.name))
      .map(s => addValueSchema(db, newDs.id, s))
  );

const copyTransformedToOtherDataset = async (
  db: Db,
  oldDsId: string,
  newDsId: string,
  nodeId: string,
  transformFn: (obj: Entry) => Values
) => {
  processEntries(db, oldDsId, nodeId, async doc => {
    const newValues = transformFn(doc);
    await createEntry(db, newDsId, newValues);
  });
};
