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
import { validateDataset, validateDatasetId } from './utils';

export const SelectValuesNode: ServerNodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeForm
> = {
  name: SelectValuesNodeDef.name,
  isInputValid: async inputs => validateDatasetId(inputs.dataset),
  isFormValid: async form => {
    if (!form.values) {
      return false;
    }

    if (form.values.length === 0) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, inputs, db) => {
    await validateDataset(inputs.dataset.id, db);

    const existingDs = await getDataset(db, inputs.dataset.id);
    const schemasOnDs = existingDs!.valueschemas.map(n => n.name);
    const unknownValues = form.values!.filter(n => !schemasOnDs.includes(n));
    if (unknownValues.length > 0) {
      throw new Error('Unknown value specified');
    }

    // TODO proper dynamic naming of generated datasets
    const newDs = await createDataset(db, 'created-name');
    await Promise.all(
      existingDs!.valueschemas
        .filter(s => form.values!.includes(s.name))
        .map(s => addValueSchema(db, newDs.id, s))
    );

    return {
      outputs: {
        dataset: {
          id: newDs.id
        }
      }
    };
  }
};
