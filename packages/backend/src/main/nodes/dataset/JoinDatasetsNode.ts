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
  getEntriesByValue
} from '../../workspace/entry';
import { validateNonEmptyString } from '../string/utils';
import { validateDatasetId } from './utils';

const JOIN_ENTRIES_BATCH_COUNT = 200;

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
    await addSchemasFromBothDatasets(
      db,
      newDs,
      dsA!,
      dsB!,
      form.valueA!,
      form.valueB!
    );
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
  for (let i = 0; i < allEntriesFromA.length / JOIN_ENTRIES_BATCH_COUNT; ++i) {
    await Promise.all(
      allEntriesFromA
        .slice(i * JOIN_ENTRIES_BATCH_COUNT, (i + 1) * JOIN_ENTRIES_BATCH_COUNT)
        .map(async e => {
          const valFromA = e.values[valNameA];
          const matchingEntriesFromB = await getEntriesByValue(db, dsB.id, {
            name: valNameB,
            val: valFromA
          });

          await Promise.all(
            matchingEntriesFromB.map(async matchedE => {
              const allFromA = Array.from(Object.entries(e.values));
              const allFromB = Array.from(
                Object.entries(matchedE.values)
              ).filter(n => !Object.keys(allFromA).includes(n[0]));

              await createEntry(
                db,
                newDs.id,
                allFromA.concat(allFromB).map(n => ({ name: n[0], val: n[1] }))
              );
            })
          );
        })
    );
  }
};

const addSchemasFromBothDatasets = async (
  db: Db,
  newDs: Dataset,
  dsA: Dataset,
  dsB: Dataset,
  valueAName: string,
  valueBName: string
) => {
  await addValueSchema(db, newDs.id, {
    ...dsA.valueschemas.find(n => n.name === valueAName)!,
    unique: false
  });
  if (valueAName !== valueBName) {
    await addValueSchema(db, newDs.id, {
      ...dsB.valueschemas.find(n => n.name === valueBName)!,
      unique: false
    });
  }

  await Promise.all(
    dsA.valueschemas
      .filter(n => n.name !== valueAName && n.name !== valueBName)
      .map(s => addValueSchema(db, newDs.id, s))
  );
  await Promise.all(
    dsB.valueschemas
      .filter(
        s =>
          !dsA.valueschemas.map(n => n.name).includes(s.name) &&
          s.name !== valueAName &&
          s.name !== valueBName
      )
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
};

const getMatchSchema = (name: string, schemas: Array<ValueSchema>) =>
  schemas.find(n => n.name === name) || null;
