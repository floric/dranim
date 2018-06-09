import { NodeDef } from '../nodes';
import { DatasetSocket, SocketDef } from '../sockets';
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
  name: 'Edit Entries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Entry'],
  keywords: []
};

export const FilterEntriesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Filter Entries',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Entry'],
  keywords: []
};

export interface AddValuesNodeForm {
  values: Array<SocketDef>;
}

export const AddValuesNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: 'Add Values',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {
    dataset: DatasetSocket('Dataset')
  },
  path: ['Entry'],
  keywords: []
};
