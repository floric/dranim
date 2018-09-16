import {
  allAreDefinedAndPresent,
  JoinDatasetsNodeDef,
  JoinDatasetsNodeForm,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  ServerNodeDef,
  Values,
  ValueSchema
} from '@masterthesis/shared';

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
  onNodeExecution: async (form, inputs) => {
    const schemaFromA = inputs.datasetA.schema.find(
      n => form.valueA === n.name
    );
    const schemaFromB = inputs.datasetB.schema.find(
      n => form.valueB === n.name
    );
    if (!schemaFromA || !schemaFromB) {
      throw new Error('Schema not found in Dataset');
    }

    if (schemaFromA.type !== schemaFromB.type) {
      throw new Error('Schema types do not match');
    }

    const entries: Array<Values> = [];
    for (const eA of inputs.datasetA.entries) {
      const valueFromA = eA[form.valueA!];
      for (const eB of inputs.datasetB.entries) {
        const valueFromB = eB[form.valueB!];
        if (valueFromA === valueFromB) {
          entries.push(merge(eA, eB));
        }
      }
    }

    return {
      outputs: {
        joined: {
          entries,
          schema: getJoinedSchemas(
            inputs.datasetA.schema,
            inputs.datasetB.schema
          )
        }
      }
    };
  }
};

const merge = (eA: Values, eB: Values) => {
  const res = {};
  Object.entries(eA).forEach(([name, content]) => {
    res[`A_${name}`] = content;
  });
  Object.entries(eB).forEach(([name, content]) => {
    res[`B_${name}`] = content;
  });
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
