import { NodeDef } from '../nodes';
import { DataSocket, EntrySocket } from '../sockets';
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
