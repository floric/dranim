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

export const FilterEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Filter Dataset',
  type: 'FilterEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Dataset'],
  keywords: []
};

export interface DistinctEntriesNodeForm {
  distinctSchemas: Array<ValueSchema>;
  addedSchemas: Array<ValueSchema>;
}

export const DistinctEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Distinct Entries',
  type: 'DistinctEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Dataset', 'Aggregation'],
  keywords: []
};

export interface EditEntriesNodeForm {
  values: Array<ValueSchema>;
}

export const EditEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Edit Entries',
  type: 'EditEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Dataset', 'Modification'],
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
  name: 'Count Entries',
  type: 'CountEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    count: NumberSocket('Count')
  },
  path: ['Dataset', 'Aggregation'],
  keywords: []
};

export enum AggregationEntriesType {
  SUM = 'Sum',
  AVG = 'Average',
  MIN = 'Minimum',
  MAX = 'Maximum'
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
  name: 'Aggregate Entries',
  type: 'AggregateEntries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    value: NumberSocket('Aggregated value')
  },
  path: ['Dataset', 'Aggregation'],
  keywords: []
};
