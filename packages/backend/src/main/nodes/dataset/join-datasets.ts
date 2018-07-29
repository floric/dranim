import {
  allAreDefinedAndPresent,
  ApolloContext,
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

import { createUniqueDatasetName } from '../../calculation/utils';
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
  onNodeExecution: async (form, inputs, { node, reqContext }) => {
    const [dsA, dsB] = await Promise.all([
      tryGetDataset(inputs.datasetA.datasetId, reqContext),
      tryGetDataset(inputs.datasetB.datasetId, reqContext)
    ]);

    validateSchemas(form, dsA, dsB);

    const newDs = await createDataset(
      createUniqueDatasetName(JoinDatasetsNodeDef.type, node.id),
      reqContext,
      node.workspaceId
    );
    await addSchemasFromBothDatasets(newDs, dsA, dsB, reqContext);
    await processEntries(
      dsA!.id,
      node.id,
      entry =>
        getMatchesAndCreateEntries(
          entry,
          form.valueA!,
          form.valueB!,
          newDs.id,
          dsB.id,
          reqContext
        ),
      reqContext
    );

    return { outputs: { joined: { datasetId: newDs.id } } };
  }
};

const getMatchesAndCreateEntries = async (
  docA: Entry,
  valNameA: string,
  valNameB: string,
  newDsId: string,
  dsBId: string,
  reqContext: ApolloContext
) => {
  const col = getEntryCollection(dsBId, reqContext.db);
  const valFromA = docA.values[valNameA];
  const cursor = col.find({ [`values.${valNameB}`]: valFromA });
  while (await cursor.hasNext()) {
    const docB = await cursor.next();
    await createEntry(
      newDsId,
      joinEntry(docA.values, docB!.values),
      reqContext
    );
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
  newDs: Dataset,
  dsA: Dataset,
  dsB: Dataset,
  reqContext: ApolloContext
) => {
  await Promise.all(
    Object.entries(dsA.valueschemas).map(val =>
      addValueSchema(
        newDs.id,
        {
          ...val[1],
          unique: false,
          name: `A_${val[1].name}`
        },
        reqContext
      )
    )
  );
  await Promise.all(
    Object.entries(dsB.valueschemas).map(val =>
      addValueSchema(
        newDs.id,
        {
          ...val[1],
          unique: false,
          name: `B_${val[1].name}`
        },
        reqContext
      )
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
