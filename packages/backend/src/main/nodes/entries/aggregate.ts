import {
  AggregateEntriesNodeDef,
  AggregateEntriesNodeForm,
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs,
  AggregationEntriesType,
  allAreDefinedAndPresent,
  ApolloContext,
  ServerNodeDef
} from '@masterthesis/shared';

import { tryGetDataset } from '../../workspace/dataset';
import { getEntryCollection } from '../../workspace/entry';

export const AggregateEntriesNode: ServerNodeDef<
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs,
  AggregateEntriesNodeForm
> = {
  type: AggregateEntriesNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { value: { content: {}, isPresent: false } };
    }

    return { value: { content: {}, isPresent: true } };
  },
  onNodeExecution: async (form, inputs, { reqContext }) => {
    const ds = await tryGetDataset(inputs.dataset.datasetId, reqContext);

    let value = 0;
    if (form.type === AggregationEntriesType.AVG) {
      value = await getValue('avg', ds.id, form.valueName!, reqContext);
    } else if (form.type === AggregationEntriesType.MIN) {
      value = await getValue('min', ds.id, form.valueName!, reqContext);
    } else if (form.type === AggregationEntriesType.MAX) {
      value = await getValue('max', ds.id, form.valueName!, reqContext);
    } else if (form.type === AggregationEntriesType.SUM) {
      value = await getValue('sum', ds.id, form.valueName!, reqContext);
    }

    return {
      outputs: {
        value
      }
    };
  }
};

const getValue = async (
  type: 'avg' | 'sum' | 'min' | 'max',
  dsId: string,
  valueName: string,
  reqContext: ApolloContext
): Promise<number> => {
  const entryColl = getEntryCollection(dsId, reqContext.db);

  console.log(type);
  console.log(valueName);

  const value = await entryColl
    .aggregate([
      { $group: { _id: null, value: { [`$${type}`]: `$values.${valueName}` } } }
    ])
    .next();

  console.log(value);

  return 0;
};
