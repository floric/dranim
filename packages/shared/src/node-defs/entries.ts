import { NodeDef } from '../nodes';
import { DatasetSocket } from '../sockets';
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

export interface RemoveValuesNodeInputs {
  dataset: DatasetRef;
}

export interface RemoveValuesNodeOutputs {
  dataset: DatasetRef;
}

export interface RemoveValuesNodeForm {
  values: Array<string>;
}

export const RemoveValuesNodeDef: NodeDef<
  RemoveValuesNodeInputs,
  RemoveValuesNodeOutputs
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
