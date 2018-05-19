export enum NodeState {
  VALID = 'VALID',
  ERROR = 'ERROR',
  INVALID = 'INVALID'
}

export interface FormValue {
  name: string;
  value: string;
}

export enum SocketType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export enum DataType {
  DATASET = 'Dataset',
  NUMBER = 'Number',
  STRING = 'String'
}

export interface NodeDef {
  name: string;
  inputs: Array<SocketDef>;
  outputs: Array<SocketDef>;
  path: Array<string>;
  keywords: Array<string>;
}

export type NodeExecutionOutputs = Map<string, string>;

export interface NodeExecutionResult {
  outputs: NodeExecutionOutputs;
}

export interface ServerNodeDef {
  name: string;
  isFormValid?: (form: Map<string, string>) => boolean;
  isInputValid?: (inputs: NodeExecutionOutputs) => Promise<boolean>;
  onServerExecution: (
    form: Map<string, string>,
    inputs: NodeExecutionOutputs
  ) => Promise<NodeExecutionResult>;
}

export interface ConnectionDescription {
  name: string;
  connectionId: string;
}

export interface NodeInstance {
  id: string;
  x: number;
  y: number;
  state: NodeState;
  workspaceId: string;
  outputs: Array<ConnectionDescription>;
  inputs: Array<ConnectionDescription>;
  type: string;
  form: Array<FormValue>;
}

export interface SocketInstance {
  nodeId: string;
  name: string;
}

export interface SocketDef {
  dataType: DataType;
  name: string;
}

export interface ConnectionInstance extends ConnectionWithoutId {
  id: string;
  workspaceId: string;
}

export interface ConnectionWithoutId {
  from: SocketInstance;
  to: SocketInstance;
}

export interface Workspace {
  id: string;
  name: string;
  lastChange: string;
  created: string;
  description: string;
  nodes: Array<Node>;
  connections: Array<ConnectionInstance>;
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
