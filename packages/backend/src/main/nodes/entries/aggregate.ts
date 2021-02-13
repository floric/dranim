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
import { Observable } from 'rxjs';
import { map, reduce, count, min, max } from 'rxjs/operators';

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
        const sum = await getSum(entries, valueName!);
        value = sum / (await getCount(entries));
        break;
      }
      case AggregationEntriesType.MAX: {
        value = await getMax(entries, valueName!);
        break;
      }
      case AggregationEntriesType.MIN: {
        value = await getMin(entries, valueName!);
        break;
      }
      case AggregationEntriesType.SUM: {
        value = await getSum(entries, valueName!);
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

const getCount = (values: Observable<Values>) =>
  values.pipe(count()).toPromise();

const getSum = (values: Observable<Values>, valueName: string) =>
  values
    .pipe<number, number>(
      map(a => a[valueName!]),
      reduce((a, b) => a + b)
    )
    .toPromise();

const getMin = (values: Observable<Values>, valueName: string) =>
  values
    .pipe<number, number>(
      map(a => a[valueName!]),
      min()
    )
    .toPromise();

const getMax = (values: Observable<Values>, valueName: string) =>
  values
    .pipe<number, number>(
      map(a => a[valueName!]),
      max()
    )
    .toPromise();
