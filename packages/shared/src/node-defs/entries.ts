import { NodeDef } from '../nodes';
import { DatasetSocket, NumberSocket } from '../sockets';
import { ValueSchema } from '../workspace';
import { DatasetRef } from './dataset';

export interface EntryRef {
  entryId: string;
}

export interface ForEachEntryNodeInputs {
  dataset: DatasetRef;
}

export interface ForEachEntryNodeOutputs {
  dataset: DatasetRef;
}

export const EditEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Edit',
  type: 'EditEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Entries'],
  keywords: []
};

export const FilterEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Filter',
  type: 'FilterEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Entries'],
  keywords: []
};

export interface DistinctEntriesNodeForm {
  schema: ValueSchema;
  newSchemas: Array<ValueSchema>;
}

export const DistinctEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Distinct',
  type: 'DistinctEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Entries'],
  keywords: []
};

export interface AddValuesNodeForm {
  values: Array<ValueSchema>;
}

export const AddValuesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Add Values',
  type: 'AddValuesEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Entries'],
  keywords: []
};

export interface SelectValuesNodeInputs {
  dataset: DatasetRef;
}

export interface SelectValuesNodeOutputs {
  dataset: DatasetRef;
}

export interface SelectValuesNodeForm {
  values: Array<string>;
}

export const SelectValuesNodeDef: NodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs
> = {
  name: 'Select Values',
  type: 'SelectValueEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Dataset', 'Operators'],
  keywords: []
};

export interface CountEntriesNodeInputs {
  dataset: DatasetRef;
}

export interface CountEntriesNodeOutputs {
  count: number;
}

export const CountEntriesNodeDef: NodeDef<
  CountEntriesNodeInputs,
  CountEntriesNodeOutputs
> = {
  name: 'Count',
  type: 'CountEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    count: NumberSocket('Count')
  },
  path: ['Entries'],
  keywords: []
};

export enum AggregationEntriesType {
  SUM = 'Sum',
  AVG = 'Average',
  MIN = 'Minimum',
  MAX = 'Maximum',
  MED = 'Median'
}

export interface AggregateEntriesNodeInputs {
  dataset: DatasetRef;
}

export interface AggregateEntriesNodeOutputs {
  value: number;
}

export interface AggregateEntriesNodeForm {
  type: AggregationEntriesType;
  valueName: string;
}

export const AggregateEntriesNodeDef: NodeDef<
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs
> = {
  name: 'Aggregate',
  type: 'AggregateEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    value: NumberSocket('Aggregated value')
  },
  path: ['Entries'],
  keywords: []
};
