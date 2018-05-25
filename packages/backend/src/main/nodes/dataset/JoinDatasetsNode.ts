import {
  FormValues,
  JoinDatasetsNodeDef,
  JoinDatasetsNodeForm,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  ServerNodeDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  addValueSchema,
  createDataset,
  Dataset,
  getDataset
} from '../../workspace/dataset';
import {
  createEntry,
  getAllEntries,
  getEntriesByUniqueValue
} from '../../workspace/entry';
import { validateNonEmptyString } from '../string/utils';
import { validateDatasetId } from './utils';

export const JoinDatasetsNode: ServerNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  JoinDatasetsNodeForm
> = {
  name: JoinDatasetsNodeDef.name,
  isInputValid: async inputs =>
    validateDatasetId(inputs.datasetA) && validateDatasetId(inputs.datasetB),
  isFormValid: async form =>
    validateNonEmptyString(form.valueA) && validateNonEmptyString(form.valueB),
  onServerExecution: async (form, inputs, db) => {
    const [dsA, dsB] = await Promise.all([
      getDataset(db, inputs.datasetA.id),
      getDataset(db, inputs.datasetB.id)
    ]);

    await validateSchemas(form, dsA!, dsB!);

    const newDs = await createDataset(db, new Date().toISOString());
    await addSchemasFromBothDatasets(db, newDs, dsA!, dsB!);
    await joinEntries(db, form.valueA!, form.valueB!, newDs, dsA!, dsB!);

    return { outputs: { joined: { id: newDs.id } } };
  }
};

const joinEntries = async (
  db: Db,
  valNameA: string,
  valNameB: string,
  newDs: Dataset,
  dsA: Dataset,
  dsB: Dataset
) => {
  const allEntriesFromA = await getAllEntries(db, dsA.id);
  for (let i = 0; i < allEntriesFromA.length / 500; ++i) {
    await Promise.all(
      allEntriesFromA.slice(i * 500, (i + 1) * 500).map(async e => {
        const valFromA = e.values[valNameA];
        const matchingEntriesFromB = await getEntriesByUniqueValue(db, dsB.id, {
          name: valNameB,
          val: valFromA
        });

        await Promise.all(
          matchingEntriesFromB.map(async matchedE => {
            const allFromA = Array.from(Object.entries(e.values));
            const allFromB = Array.from(Object.entries(matchedE.values)).filter(
              n => !Object.keys(allFromA).includes(n[0])
            );

            await createEntry(
              db,
              newDs.id,
              allFromA.concat(allFromB).map(n => ({ name: n[0], val: n[1] }))
            );
          })
        );
      })
    );
    console.log(`${i} of ${allEntriesFromA.length / 500}`);
  }
};

const addSchemasFromBothDatasets = async (
  db: Db,
  newDs: Dataset,
  dsA: Dataset,
  dsB: Dataset
) => {
  await Promise.all(dsA.valueschemas.map(s => addValueSchema(db, newDs.id, s)));
  // add only non used keys -> use RenameValueNode to change value names
  await Promise.all(
    dsB.valueschemas
      .filter(s => !dsA.valueschemas.map(n => n.name).includes(s.name))
      .map(s => addValueSchema(db, newDs.id, s))
  );
};

const validateSchemas = async (
  form: FormValues<JoinDatasetsNodeForm>,
  dsA: Dataset,
  dsB: Dataset
) => {
  if (!dsA || !dsB) {
    throw new Error('Unknown dataset');
  }

  const schemaA = getMatchSchema(form.valueA!, dsA.valueschemas);
  const schemaB = getMatchSchema(form.valueB!, dsB.valueschemas);

  if (!schemaA || !schemaB) {
    throw new Error('Schema not found');
  }

  if (schemaA.type !== schemaB.type) {
    throw new Error('Schemas should have same type');
  }

  if (schemaA.unique !== true) {
    throw new Error('First schema needs to be unique');
  }
};

const getMatchSchema = (name: string, schemas: Array<ValueSchema>) =>
  schemas.find(n => n.name === name) || null;
