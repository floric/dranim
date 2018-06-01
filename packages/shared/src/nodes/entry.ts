import { NodeDef } from '../nodes';
import { BooleanSocket, DataSocket, EntrySocket } from '../sockets';
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

export interface EditEntriesFnInputs {
  entry: EntryRef;
}

export interface EditEntriesFnOutputs {
  entry: EntryRef;
}

export const EditEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  EditEntriesFnInputs,
  EditEntriesFnOutputs
> = {
  name: 'Edit Entries',
  inputs: {
    dataset: DataSocket('Dataset')
  },
  outputs: {
    dataset: DataSocket('Dataset')
  },
  contextFn: {
    inputs: {
      entry: EntrySocket('Entry')
    },
    outputs: {
      entry: EntrySocket('Entry')
    }
  },
  path: ['Entry'],
  keywords: []
};

export interface FilterEntriesFnInputs {
  entry: EntryRef;
}

export interface FilterEntriesFnOutputs {
  keepEntry: boolean;
}

export const FilterEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  FilterEntriesFnInputs,
  FilterEntriesFnOutputs
> = {
  name: 'Filter Entries',
  inputs: {
    dataset: DataSocket('Dataset')
  },
  outputs: {
    dataset: DataSocket('Dataset')
  },
  contextFn: {
    inputs: {
      entry: EntrySocket('Entry')
    },
    outputs: {
      keepEntry: BooleanSocket('Keep Entry')
    }
  },
  path: ['Entry'],
  keywords: []
};
