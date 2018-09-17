import {
  AggregateEntriesNodeDef,
  AggregateEntriesNodeForm,
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs,
  AggregationEntriesType,
  allAreDefinedAndPresent,
  DataType,
  ServerNodeDef,
  Values
} from '@masterthesis/shared';

export const AggregateEntriesNode: ServerNodeDef<
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs,
  AggregateEntriesNodeForm
> = {
  type: AggregateEntriesNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs) || !form.valueName) {
      return { value: { content: {}, isPresent: false } };
    }

    return { value: { content: {}, isPresent: true } };
  },
  onNodeExecution: async (form, inputs) => {
    const { valueName } = form;
    const {
      dataset: { entries, schema }
    } = inputs;
    const matchingSchema = schema.find(n => n.name === valueName);
    if (!matchingSchema) {
      throw new Error('Schema missing in Entries');
    }

    if (matchingSchema.type !== DataType.NUMBER) {
      throw new Error('Aggregation methods only supported for numeric fields');
    }

    let value = 0;
    switch (form.type) {
      case AggregationEntriesType.AVG: {
        const sum = getSum(entries, valueName!);
        value = sum / entries.length;
        break;
      }
      case AggregationEntriesType.MAX: {
        value = getMax(entries, valueName!);
        break;
      }
      case AggregationEntriesType.MIN: {
        value = getMin(entries, valueName!);
        break;
      }
      case AggregationEntriesType.SUM: {
        value = getSum(entries, valueName!);
        break;
      }
    }
    return {
      outputs: {
        value
      }
    };
  }
};

const getSum = (values: Values, valueName: string) =>
  values.map(n => n[valueName!]).reduce((a, b) => a + b, 0);

const getMin = (values: Values, valueName: string) =>
  values.map(n => n[valueName!]).reduce((a, b) => (a > b ? b : a), 0);

const getMax = (values: Values, valueName: string) =>
  values.map(n => n[valueName!]).reduce((a, b) => (a > b ? a : b), 0);
