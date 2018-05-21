import { DatasetMeta } from './sockets';

export enum NodeState {
  VALID = 'VALID',
  ERROR = 'ERROR',
  INVALID = 'INVALID'
}

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
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  STRING = 'String'
}

export interface SocketDef<Meta = {}> {
  dataType: DataType;
  displayName: string;
  order?: number;
  meta: SocketMetaDef<Meta>;
  isConnected: boolean;
}

export interface SocketMetaDef<Meta = {}> {
  isPresent: boolean;
  content: Meta;
}

export type SocketMetaContent<T> = { [Name in keyof T]: any };
export type SocketDefsGeneric<T, M extends SocketMetaContent<T>> = {
  [Name in keyof T]: SocketDef<M[Name]>
};
export type SocketMetasGeneric<T, M extends SocketMetaContent<T>> = {
  [Name in keyof T]: SocketMetaDef<M[Name]>
};
export type SocketDefs<T> = SocketDefsGeneric<T, ConditionalMetaTypes<T>>;
export type SocketMetas<T> = SocketMetasGeneric<T, ConditionalMetaTypes<T>>;

export type FormValues<T> = { [Name in keyof T]: string | undefined };
export type IOValues<T> = { [Name in keyof T]: string };
export type ConditionalMetaTypes<T> = {
  [Name in keyof T]: T[Name] extends Dataset ? DatasetMeta : {}
};

export interface NodeDef<NodeInputs = {}, NodeOutputs = {}> {
  name: string;
  inputs: SocketDefs<NodeInputs>;
  outputs: SocketDefs<NodeOutputs>;
  path: Array<string>;
  keywords: Array<string>;
}

export interface NodeExecutionResult<NodeOutputs> {
  outputs: IOValues<NodeOutputs>;
}

export interface ServerNodeDef<
  NodeInputs = {},
  NodeOutputs = {},
  NodeForm = {}
> {
  name: string;
  isFormValid?: (form: FormValues<NodeForm>) => Promise<boolean>;
  isInputValid?: (inputs: IOValues<NodeInputs>) => Promise<boolean>;
  onServerExecution: (
    form: NodeForm,
    inputs: IOValues<NodeInputs>
  ) => Promise<NodeExecutionResult<NodeOutputs>>;
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
  nodes: Array<NodeInstance>;
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

export interface UploadProcess {
  id: string;
  start: string;
  finish: string | null;
  errors: Array<{ name: string; message: string; count: number }>;
  state: 'STARTED' | 'PROCESSING' | 'FINISHED' | 'ERROR';
  addedEntries: number;
  failedEntries: number;
  invalidEntries: number;
}
