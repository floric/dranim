import { Db } from 'mongodb';

import { SocketDefs } from './sockets';

export enum NodeState {
  VALID = 'VALID',
  ERROR = 'ERROR',
  INVALID = 'INVALID'
}

export enum ContextNodeType {
  INPUT = 'ContextInputNode',
  OUTPUT = 'ContextOutputNode'
}

export interface FormValue {
  name: string;
  value: string;
}

export type FormValues<T> = { [Name in keyof T]: T[Name] | null };
export type IOValues<T> = { [Name in keyof T]: T[Name] };

export interface NodeDef<
  NodeInputs = {},
  NodeOutputs = {},
  FunctionInputs = {},
  FunctionOutputs = {}
> {
  name: string;
  inputs: SocketDefs<NodeInputs>;
  outputs: SocketDefs<NodeOutputs>;
  contextFn?: {
    inputs: SocketDefs<FunctionInputs>;
    outputs: SocketDefs<FunctionOutputs>;
  };
  path: Array<string>;
  keywords: Array<string>;
  isContextNode?: boolean;
}

export interface NodeExecutionResult<NodeOutputs, NodeResults = {}> {
  outputs: IOValues<NodeOutputs>;
  results?: NodeResults;
}

export interface ServerNodeDef<
  NodeInputs = {},
  NodeOutputs = {},
  NodeForm = {},
  NodeResults = {}
> {
  name: string;
  isFormValid?: (form: FormValues<NodeForm>) => Promise<boolean>;
  isInputValid?: (inputs: IOValues<NodeInputs>) => Promise<boolean>;
  onServerExecution: (
    form: FormValues<NodeForm>,
    inputs: IOValues<NodeInputs>,
    db: Db
  ) => Promise<NodeExecutionResult<NodeOutputs, NodeResults>>;
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
  contextIds: Array<string>;
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
  contextIds: Array<string>;
  workspaceId: string;
}

export interface ConnectionWithoutId {
  from: SocketInstance;
  to: SocketInstance;
}
