import {
  AggregateEntriesNodeDef,
  AggregateEntriesNodeForm,
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs,
  AggregationEntriesType,
  allAreDefinedAndPresent,
  ApolloContext,
  DataType,
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
    const matchingSchema = ds.valueschemas.find(n => n.name === form.valueName);
    if (!matchingSchema) {
      throw new Error('Schema not found');
    }

    if (matchingSchema.type !== DataType.NUMBER) {
      throw new Error('Datatype not supported');
    }

    let value = 0;
    if (form.type === AggregationEntriesType.AVG) {
      value = await getValue('avg', ds.id, form.valueName!, reqContext);
    } else if (form.type === AggregationEntriesType.MIN) {
      value = await getValue('min', ds.id, form.valueName!, reqContext);
    } else if (form.type === AggregationEntriesType.MAX) {
      value = await getValue('max', ds.id, form.valueName!, reqContext);
    } else if (form.type === AggregationEntriesType.SUM) {
      value = await getValue('sum', ds.id, form.valueName!, reqContext);
    } else if (form.type === AggregationEntriesType.MED) {
      throw new Error('Median not supported yet');
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

  const value = await entryColl
    .aggregate([
      { $group: { _id: null, value: { [`$${type}`]: `$values.${valueName}` } } }
    ])
    .next();

  return (value as any).value;
};
