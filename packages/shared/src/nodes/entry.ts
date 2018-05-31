import { NodeDef } from '../nodes';
import { DataSocket } from '../sockets';
import { DatasetRef } from './dataset';

export interface EntryModification<Args> {
  name: string;
  discardNode: boolean;
  args: Args;
}

export interface ForEachEntryNodeInputs {
  dataset: DatasetRef;
}

export interface ForEachEntryNodeOutputs {
  dataset: DatasetRef;
}

export const ForEachEntryNodeDef: NodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  { test: number },
  { abc: number }
> = {
  name: 'For each Entry',
  inputs: {
    dataset: DataSocket('Dataset')
  },
  outputs: {
    dataset: DataSocket('Dataset')
  },
  fnInputs: {
    test: 9
  },
  fnOutputs: {
    abc: 9
  },
  path: ['Entry'],
  keywords: []
};
