import {
  Entry,
  FilterDatasetNodeDef,
  FilterDatasetNodeForm,
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs,
  ServerNodeDef,
  sleep
} from '@masterthesis/shared';

import { getCreatedDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';
import { validateDatasetInput } from './utils';

interface MappedConditionRule {
  [name: string]: any;
}

interface MappedConditions {
  equals: MappedConditionRule;
  greaterThan: MappedConditionRule;
  lessThan: MappedConditionRule;
  isPresent: MappedConditionRule;
}

export const FilterDatasetNode: ServerNodeDef<
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs,
  FilterDatasetNodeForm
> = {
  name: FilterDatasetNodeDef.name,
  isInputValid: inputs => validateDatasetInput(inputs),
  isFormValid: form => {
    const conditions = form.conditions;
    if (!conditions) {
      return Promise.resolve(false);
    }

    const rulesCount = [
      conditions.equals,
      conditions.greaterThan,
      conditions.isPresent,
      conditions.lessThan
    ]
      .map(n => n.length)
      .reduce((a, b) => a + b, 0);
    if (rulesCount === 0) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  },
  onServerExecution: async (form, inputs, db) => {
    const oldDs = await getDataset(db, inputs.dataset.id);
    if (!oldDs) {
      throw new Error('Invalid dataset');
    }

    const newDs = await createDataset(
      db,
      getCreatedDatasetName(FilterDatasetNode.name)
    );

    const mappedConditions = convertConditionRules(form.conditions!);

    await Promise.all(
      oldDs.valueschemas.map(v => addValueSchema(db, newDs.id, v))
    );

    const oldCollection = getEntryCollection(db, inputs.dataset.id);

    await new Promise((resolve, reject) => {
      const col = oldCollection.find();
      col.on('data', async (e: Entry) => {
        const newValues = getFilteredValues(e, mappedConditions);
        if (Object.keys(newValues).length > 0) {
          await createEntry(db, newDs.id, newValues);
        }
      });
      col.on('end', async () => {
        await sleep(500);
        resolve();
      });
      col.on('error', () => {
        reject();
      });
    });

    return {
      outputs: {
        dataset: { id: newDs.id }
      }
    };
  }
};

const doesValueRespectAllRules = (
  valName: string,
  value: number,
  mappedConditions: MappedConditions
) => {
  return Object.keys(mappedConditions)
    .map(method => {
      const methodValue = mappedConditions[method][valName];
      if (methodValue !== undefined) {
        const threshold = JSON.parse(methodValue);

        if (method === 'greaterThan') {
          return value > threshold;
        } else if (method === 'equals') {
          return value === threshold;
        } else if (method === 'lessThan') {
          return value < threshold;
        } else if (method === 'isPresent') {
          return value !== undefined && value !== null;
        } else {
          throw new Error('Unsupported method');
        }
      }

      return true;
    })
    .reduce((a, b) => a && b, true);
};

const getFilteredValues = (e: Entry, mappedConditions: MappedConditions) => {
  const newValues = {};
  const allKeys = Object.keys(e.values);

  allKeys.forEach(k => {
    const allRulesRespected = doesValueRespectAllRules(
      k,
      e.values[k],
      mappedConditions
    );

    if (allRulesRespected) {
      newValues[k] = e.values[k];
    }
  });

  return newValues;
};

const convertConditionRules = conditions => {
  const mappedConditions: MappedConditions = {
    equals: {},
    greaterThan: {},
    isPresent: {},
    lessThan: {}
  };

  Object.keys(conditions).map(method => {
    conditions![method].map(n => {
      mappedConditions[method][n.name] = n.value;
    });
  });

  return mappedConditions;
};
