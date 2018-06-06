import {
  Dataset,
  Entry,
  FormValues,
  JoinDatasetsNodeDef,
  JoinDatasetsNodeForm,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  ServerNodeDef,
  Values,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getCreatedDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';
import { validateNonEmptyString } from '../string/utils';
import { validateDatasetId } from './utils';

export const JoinDatasetsNode: ServerNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  JoinDatasetsNodeForm
> = {
  name: JoinDatasetsNodeDef.name,
  isInputValid: inputs =>
    Promise.resolve(
      validateDatasetId(inputs.datasetA) && validateDatasetId(inputs.datasetB)
    ),
  isFormValid: form =>
    Promise.resolve(
      validateNonEmptyString(form.valueA) && validateNonEmptyString(form.valueB)
    ),
  onMetaExecution: async (form, inputs, db) => {
    if (!form.valueA || !form.valueB) {
      return { joined: { isPresent: false, content: { schema: [] } } };
    }
    if (
      !inputs.datasetA ||
      !inputs.datasetB ||
      !inputs.datasetA.isPresent ||
      !inputs.datasetB.isPresent
    ) {
      return {
        joined: { isPresent: false, content: { schema: [] } }
      };
    }

    return {
      joined: {
        content: {
          schema: [
            ...inputs.datasetA.content.schema.map(s => ({
              ...s,
              name: `A_${s.name}`
            })),
            ...inputs.datasetB.content.schema.map(s => ({
              ...s,
              name: `B_${s.name}`
            }))
          ]
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (form, inputs, db) => {
    const [dsA, dsB] = await Promise.all([
      getDataset(db, inputs.datasetA.datasetId),
      getDataset(db, inputs.datasetB.datasetId)
    ]);

    await validateSchemas(form, dsA!, dsB!);

    const newDs = await createDataset(
      db,
      getCreatedDatasetName(JoinDatasetsNodeDef.name)
    );
    await addSchemasFromBothDatasets(
      db,
      newDs,
      dsA!,
      dsB!,
      form.valueA!,
      form.valueB!
    );
    await joinEntries(db, form.valueA!, form.valueB!, newDs, dsA!, dsB!);

    return { outputs: { joined: { datasetId: newDs.id } } };
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
  const aColl = getEntryCollection(db, dsA.id);
  const bColl = getEntryCollection(db, dsB.id);

  return new Promise((resolveA, rejectA) => {
    const aCursor = aColl.find();
    aCursor.on('data', async (chunkA: Entry) => {
      const valFromA = chunkA.values[valNameA];

      await new Promise((resolveB, rejectB) => {
        const bCursor = bColl.find({ [`values.${valNameB}`]: valFromA });
        bCursor.on('data', async (chunkB: Entry) => {
          createEntry(
            db,
            newDs.id,
            await joinEntry(chunkA.values, chunkB.values)
          );
        });
        bCursor.on('error', () => {
          rejectB();
        });
        bCursor.on('end', () => {
          resolveB();
        });
      });
    });
    aCursor.on('end', () => {
      resolveA();
    });
    aCursor.on('error', () => {
      rejectA();
    });
  });
};

const joinEntry = async (valuesA: Values, valuesB: Values) => {
  const res = {};

  await Promise.all(
    Object.entries(valuesA).map(val => {
      res[`A_${val[0]}`] = val[1];
    })
  );
  await Promise.all(
    Object.entries(valuesB).map(val => {
      res[`B_${val[0]}`] = val[1];
    })
  );

  return res;
};

const addSchemasFromBothDatasets = async (
  db: Db,
  newDs: Dataset,
  dsA: Dataset,
  dsB: Dataset,
  valueAName: string,
  valueBName: string
) => {
  await Promise.all(
    Object.entries(dsA.valueschemas).map(val =>
      addValueSchema(db, newDs.id, { ...val[1], name: `A_${val[1].name}` })
    )
  );
  await Promise.all(
    Object.entries(dsB.valueschemas).map(val =>
      addValueSchema(db, newDs.id, { ...val[1], name: `B_${val[1].name}` })
    )
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
