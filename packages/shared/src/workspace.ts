import {
  ConnectionInstance,
  GQLNodeInstance,
  GQLOutputResult,
  NodeState
} from './nodes';
import { DataType } from './sockets';
import { UserOwned } from './users';

export interface Values {
  [name: string]: any;
}

export interface Entry {
  id: string;
  values: Values;
}

export interface ValueSchema {
  type: DataType;
  name: string;
  required: boolean;
  fallback: string;
  unique: boolean;
}

export interface Dataset extends UserOwned {
  id: string;
  name: string;
  valueschemas: Array<ValueSchema>;
  workspaceId: string | null;
  created: string;
  description: string;
}

export interface GQLDataset extends Dataset {
  entriesCount: number;
  valueschemas: Array<ValueSchema>;
  latestEntries: Array<Entry>;
}

export interface Workspace extends UserOwned {
  id: string;
  name: string;
  lastChange: string;
  created: string;
  description: string;
}

export interface GQLWorkspace extends Workspace {
  results: Array<GQLOutputResult>;
  nodes: Array<GQLNodeInstance>;
  connections: Array<ConnectionInstance>;
  state: NodeState;
}

export enum ProcessState {
  STARTED = 'STARTED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  SUCCESSFUL = 'SUCCESSFUL',
  CANCELED = 'CANCELED'
}

export interface CalculationProcess extends UserOwned {
  id: string;
  start: string;
  finish: string | null;
  state: ProcessState;
  workspaceId: string;
}

export type GQLCalculationProcess = CalculationProcess;

export interface UploadProcess {
  id: string;
  start: string;
  finish: string | null;
  errors: Array<{ name: string; message: string; count: number }>;
  state: ProcessState;
  addedEntries: number;
  failedEntries: number;
  invalidEntries: number;
}

export type GQLUploadProcess = UploadProcess;
