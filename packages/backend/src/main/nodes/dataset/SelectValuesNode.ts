import {
  SelectValuesNodeDef,
  SelectValuesNodeForm,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../main/workspace/dataset';
import { getCreatedDatasetName } from '../../calculation/utils';
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

    const newDs = await createDataset(
      db,
      getCreatedDatasetName(SelectValuesNodeDef.name)
    );
    await Promise.all(
      existingDs!.valueschemas
        .filter(s => form.values!.includes(s.name))
        .map(s => addValueSchema(db, newDs.id, s))
    );
    // TODO copy entries and test

    return {
      outputs: {
        dataset: {
          id: newDs.id
        }
      }
    };
  }
};
