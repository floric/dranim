import { ConnectionInstance, NodeInstance } from './nodes';
import { DataType } from './sockets';

export interface Value {
  val: string;
  name: string;
}

export interface Entry {
  id: string;
  values: Array<Value>;
}

export interface ValueSchema {
  type: DataType;
  name: string;
  required: boolean;
  fallback: string;
  unique: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  entriesCount: number;
  valueschemas: Array<ValueSchema>;
  latestEntries: Array<Entry>;
}

export interface Workspace {
  id: string;
  name: string;
  lastChange: string;
  created: string;
  description: string;
  nodes: Array<NodeInstance>;
  connections: Array<ConnectionInstance>;
}

export enum ProcessState {
  STARTED = 'STARTED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  SUCCESSFUL = 'SUCCESSFUL'
}

export interface CalculationProcess {
  id: string;
  start: string;
  finish: string | null;
  processedOutputs: number;
  totalOutputs: number;
  state: ProcessState;
}

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
