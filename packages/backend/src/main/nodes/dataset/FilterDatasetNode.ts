import {
  Entry,
  FilterDatasetNodeDef,
  FilterDatasetNodeForm,
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { getCreatedDatasetName } from '../../calculation/utils';
import { createDataset, getDataset } from '../../workspace/dataset';
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
    const rulesCount = Object.keys(form)
      .map(type =>
        Object.keys(form[type]).map(method => form[type][method].length)
      )
      .reduce((a, b) => a.concat(b), [])
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
