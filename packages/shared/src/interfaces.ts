export type FormValues = Array<{ name: string; value: string }>;
export type FormValuesMap = Map<string, string>;

export enum NodeState {
  VALID = 'VALID',
  ERROR = 'ERROR',
  INVALID = 'INVALID'
}

export interface NodeInstance {
  id: string;
  x: number;
  y: number;
  workspaceId: string;
  outputs: Array<{ name: string; connectionId: string }>;
  inputs: Array<{ name: string; connectionId: string }>;
  type: string;
  form: FormValues;
}

export interface Socket {
  nodeId: string;
  name: string;
}

export interface Connection extends ConnectionWithoutId {
  id: string;
}

export interface ConnectionWithoutId {
  from: Socket;
  to: Socket;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  lastChange: string;
  created: string;
  description: string;
  nodes: Array<Node>;
  connections: Array<Connection>;
}

export enum CalculationProcessState {
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
  state: CalculationProcessState;
}
