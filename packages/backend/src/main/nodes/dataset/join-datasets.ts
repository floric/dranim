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
import { toArray } from 'rxjs/operators';

import { validateNonEmptyString } from '../string/utils';
import { Observable, Subscriber } from 'rxjs';

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

    const a = await inputs.datasetA.entries.pipe(toArray()).toPromise();
    const b = await inputs.datasetB.entries.pipe(toArray()).toPromise();

    const observable = new Observable(subscriber => {
      combineEntries(subscriber, a, b, form.valueA!, form.valueB!);
      subscriber.complete();
    });
    const schema = getJoinedSchemas(
      inputs.datasetA.schema,
      inputs.datasetB.schema
    );

    return {
      outputs: {
        joined: {
          entries: observable,
          schema
        }
      }
    };
  }
};

const combineEntries = (
  subscriber: Subscriber<Values>,
  entriesA: Array<Values>,
  entriesB: Array<Values>,
  valueA: string,
  valueB: string
) => {
  for (const eA of entriesA) {
    const valueFromA = eA[valueA!];
    for (const eB of entriesB) {
      const valueFromB = eB[valueB!];
      if (valueFromA === valueFromB) {
        subscriber.next(merge(eA, eB));
      }
    }
  }
};

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
