import {
  allAreDefinedAndPresent,
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
import { Collection, Db } from 'mongodb';

import { createDynamicDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  tryGetDataset
} from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';
import { processEntries } from '../entries/utils';
import { validateNonEmptyString } from '../string/utils';

export const JoinDatasetsNode: ServerNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  JoinDatasetsNodeForm
> = {
  type: JoinDatasetsNodeDef.type,
  isFormValid: form =>
    Promise.resolve(
      validateNonEmptyString(form.valueA) && validateNonEmptyString(form.valueB)
    ),
  onMetaExecution: async (form, inputs, db) => {
    if (!form.valueA || !form.valueB) {
      return { joined: { isPresent: false, content: { schema: [] } } };
    }
    if (!allAreDefinedAndPresent(inputs)) {
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
  onNodeExecution: async (form, inputs, { db, node }) => {
    const [dsA, dsB] = await Promise.all([
      tryGetDataset(inputs.datasetA.datasetId, db),
      tryGetDataset(inputs.datasetB.datasetId, db)
    ]);

    validateSchemas(form, dsA, dsB);

    const newDs = await createDataset(
      db,
      createDynamicDatasetName(JoinDatasetsNodeDef.type, node.id),
      node.workspaceId
    );
    await addSchemasFromBothDatasets(db, newDs, dsA, dsB);
    await processEntries(db, dsA!.id, node.id, entry =>
      getMatchesAndCreateEntries(
        db,
        entry,
        form.valueA!,
        form.valueB!,
        newDs.id,
        dsB.id
      )
    );

    return { outputs: { joined: { datasetId: newDs.id } } };
  }
};

const getMatchesAndCreateEntries = async (
  db: Db,
  docA: Entry,
  valNameA: string,
  valNameB: string,
  newDsId: string,
  dsBid: string
) => {
  const col = getEntryCollection(db, dsBid);
  const valFromA = docA.values[valNameA];
  const cursor = col.find({ [`values.${valNameB}`]: valFromA });
  while (await cursor.hasNext()) {
    const docB = await cursor.next();
    await createEntry(db, newDsId, joinEntry(docA.values, docB.values));
  }
  await cursor.close();
};

const joinEntry = (valuesA: Values, valuesB: Values) => {
  const res = {};

  Object.entries(valuesA).map(val => {
    res[`A_${val[0]}`] = val[1];
  });
  Object.entries(valuesB).map(val => {
    res[`B_${val[0]}`] = val[1];
  });

  return res;
};

const addSchemasFromBothDatasets = async (
  db: Db,
  newDs: Dataset,
  dsA: Dataset,
  dsB: Dataset
) => {
  await Promise.all(
    Object.entries(dsA.valueschemas).map(val =>
      addValueSchema(db, newDs.id, {
        ...val[1],
        unique: false,
        name: `A_${val[1].name}`
      })
    )
  );
  await Promise.all(
    Object.entries(dsB.valueschemas).map(val =>
      addValueSchema(db, newDs.id, {
        ...val[1],
        unique: false,
        name: `B_${val[1].name}`
      })
    )
  );
};

const validateSchemas = (
  form: FormValues<JoinDatasetsNodeForm>,
  dsA: Dataset,
  dsB: Dataset
) => {
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
