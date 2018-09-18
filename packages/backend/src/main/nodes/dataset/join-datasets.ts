import {
  allAreDefinedAndPresent,
  ApolloContext,
  JoinDatasetsNodeDef,
  JoinDatasetsNodeForm,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  ServerNodeDef,
  Values,
  ValueSchema
} from '@masterthesis/shared';

import { updateNodeProgressWithSleep } from '../entries/utils';
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
  onMetaExecution: async (form, inputs) => {
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
          schema: getJoinedSchemas(
            inputs.datasetA.content.schema,
            inputs.datasetB.content.schema
          )
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (form, inputs, { node: { id }, reqContext }) => {
    checkSchemas(
      inputs.datasetA.schema,
      inputs.datasetB.schema,
      form.valueA!,
      form.valueB!
    );

    const entries = await combineEntries(
      inputs.datasetA.entries,
      inputs.datasetB.entries,
      form.valueA!,
      form.valueB!,
      id,
      reqContext
    );
    const schema = getJoinedSchemas(
      inputs.datasetA.schema,
      inputs.datasetB.schema
    );

    return {
      outputs: {
        joined: {
          entries,
          schema
        }
      }
    };
  }
};

const combineEntries = (
  entriesA: Array<Values>,
  entriesB: Array<Values>,
  valueA: string,
  valueB: string,
  nodeId: string,
  reqContext: ApolloContext
) =>
  new Promise<Array<Values>>(async resolve => {
    const entries: Array<Values> = [];
    let i = 0;

    for (const eA of entriesA) {
      const valueFromA = eA[valueA!];
      for (const eB of entriesB) {
        const valueFromB = eB[valueB!];
        if (valueFromA === valueFromB) {
          entries.push(merge(eA, eB));
        }
      }
      await updateNodeProgressWithSleep(i, entriesA.length, nodeId, reqContext);
      i += 1;
    }

    resolve(entries);
  });

const checkSchemas = (
  schemasA: Array<ValueSchema>,
  schemasB: Array<ValueSchema>,
  valueA: string,
  valueB: string
) => {
  const schemaFromA = schemasA.find(n => valueA === n.name);
  const schemaFromB = schemasB.find(n => valueB === n.name);
  if (!schemaFromA || !schemaFromB) {
    throw new Error('Schema not found in Dataset');
  }

  if (schemaFromA.type !== schemaFromB.type) {
    throw new Error('Schema types do not match');
  }
};

const merge = (eA: Values, eB: Values) => {
  const res = {};
  Object.entries(eA).forEach(([name, content]) => (res[`A_${name}`] = content));
  Object.entries(eB).forEach(([name, content]) => (res[`B_${name}`] = content));
  return res;
};

const getJoinedSchemas = (
  schemaA: Array<ValueSchema>,
  schemaB: Array<ValueSchema>
) => [
  ...schemaA.map(s => ({
    ...s,
    name: `A_${s.name}`
  })),
  ...schemaB.map(s => ({
    ...s,
    name: `B_${s.name}`
  }))
];
