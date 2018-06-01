import { NodeDef } from '../nodes';
import {
  BooleanSocket,
  DataSocket,
  DateSocket,
  EntrySocket,
  NumberSocket,
  StringSocket
} from '../sockets';
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

export interface GetterNodeInputs {
  entry: EntryRef;
}

export interface GetterNodeOutputs<T> {
  value: T;
}

export interface GetStringNodeOutputs extends GetterNodeOutputs<string> {}

export const GetStringNodeDef: NodeDef<
  GetterNodeInputs,
  GetStringNodeOutputs
> = {
  name: 'Get String',
  inputs: {
    entry: EntrySocket('Entry')
  },
  outputs: {
    value: StringSocket('String')
  },
  path: ['Entry', 'Getters'],
  keywords: []
};

export interface GetNumberNodeOutputs extends GetterNodeOutputs<number> {}

export const GetNumberNodeDef: NodeDef<
  GetterNodeInputs,
  GetNumberNodeOutputs
> = {
  name: 'Get Number',
  inputs: {
    entry: EntrySocket('Entry')
  },
  outputs: {
    value: NumberSocket('Number')
  },
  path: ['Entry', 'Getters'],
  keywords: []
};

export interface GetDateNodeOutputs extends GetterNodeOutputs<Date> {}

export const GetDateNodeDef: NodeDef<GetterNodeInputs, GetStringNodeOutputs> = {
  name: 'Get Date',
  inputs: {
    entry: EntrySocket('Entry')
  },
  outputs: {
    value: DateSocket('Date')
  },
  path: ['Entry', 'Getters'],
  keywords: []
};
