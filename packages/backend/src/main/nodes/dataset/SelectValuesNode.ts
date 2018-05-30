import {
  SelectValuesNodeDef,
  SelectValuesNodeForm,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  addValueSchema,
  createDataset,
  Dataset,
  getDataset
} from '../../../main/workspace/dataset';
import { getCreatedDatasetName } from '../../calculation/utils';
import { copyTransformedToOtherDataset } from '../../workspace/entry';
import { validateDataset, validateDatasetId } from './utils';

export const SelectValuesNode: ServerNodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeForm
> = {
  name: SelectValuesNodeDef.name,
  isInputValid: async inputs => validateDatasetId(inputs.dataset),
  isFormValid: form => Promise.resolve(!!form.values && form.values.length > 0),
  onServerExecution: async (form, inputs, db) => {
    await validateDataset(inputs.dataset.id, db);

    const existingDs = await getDataset(db, inputs.dataset.id);
    const schemasOnDs = existingDs!.valueschemas.map(n => n.name);
    const unknownValues = form.values!.filter(n => !schemasOnDs.includes(n));
    if (unknownValues.length > 0) {
      throw new Error('Unknown value specified');
    }

    const usedValues = new Set(form.values!);
    const newDs = await createDataset(
      db,
      getCreatedDatasetName(SelectValuesNodeDef.name)
    );

    await filterSchema(existingDs!, newDs, usedValues, db);
    await copyEntries(existingDs!, newDs, usedValues, db);

    return {
      outputs: {
        dataset: {
          id: newDs.id
        }
      }
    };
  }
};

const filterSchema = async (
  existingDs: Dataset,
  newDs: Dataset,
  usedValues: Set<string>,
  db: Db
) => {
  await Promise.all(
    existingDs!.valueschemas
      .filter(s => usedValues.has(s.name))
      .map(s => addValueSchema(db, newDs.id, s))
  );
};

const copyEntries = (
  existingDs: Dataset,
  newDs: Dataset,
  usedValues: Set<string>,
  db: Db
) =>
  copyTransformedToOtherDataset(db, existingDs.id, newDs.id, e => {
    const newValues = {};
    usedValues.forEach(u => {
      newValues[u] = e.values[u];
    });

    return newValues;
  });
