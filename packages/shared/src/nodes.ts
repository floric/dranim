import { Db } from 'mongodb';

import { DataType, SocketDefs, SocketMetas } from './sockets';

export interface ApolloContext {
  db: Db;
  userId: string;
}

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

export interface OutputNodeForm {
  name: string;
  description: string;
}

export interface OutputResult<T = any> {
  value: T;
  type: DataType;
  name: string;
  description: string;
  workspaceId: string;
}

export interface GQLOutputResult extends OutputResult<any> {
  id: string;
}

export interface NodeDef<NodeInputs = {}, NodeOutputs = {}> {
  name: string;
  type: string;
  inputs: SocketDefs<NodeInputs>;
  outputs: SocketDefs<NodeOutputs>;
  isOutputNode?: boolean;
  path: Array<string>;
  keywords: Array<string>;
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
  type: string;
  isFormValid?: (form: FormValues<NodeForm>) => Promise<boolean>;
  isInputValid?: (inputs: IOValues<NodeInputs>) => Promise<boolean>;
  onNodeExecution: (
    form: FormValues<NodeForm>,
    inputs: IOValues<NodeInputs>,
    context: {
      reqContext: ApolloContext;
      node: NodeInstance;
    }
  ) => Promise<NodeExecutionResult<NodeOutputs, NodeResults>>;
  onMetaExecution: (
    form: FormValues<NodeForm>,
    inputs: SocketMetas<NodeInputs>,
    reqContext: ApolloContext
  ) => Promise<SocketMetas<NodeOutputs>>;
}

export interface ServerNodeDefWithContextFn<
  NodeInputs = {},
  NodeOutputs = {},
  NodeForm = {},
  NodeResults = {},
  ContextResults = {}
> extends ServerNodeDef<NodeInputs, NodeOutputs, NodeForm, NodeResults> {
  onNodeExecution: (
    form: FormValues<NodeForm>,
    inputs: IOValues<NodeInputs>,
    context: {
      node: NodeInstance;
      reqContext: ApolloContext;
      contextFnExecution?: (
        input: IOValues<any>
      ) => Promise<NodeExecutionResult<ContextResults>>;
    }
  ) => Promise<NodeExecutionResult<NodeOutputs, NodeResults>>;
  transformInputDefsToContextInputDefs: (
    inputsDefs: SocketDefs<NodeInputs>,
    inputs: SocketMetas<NodeInputs>,
    form: FormValues<NodeForm>,
    reqContext: ApolloContext
  ) => Promise<SocketDefs<any>>;
  transformContextInputDefsToContextOutputDefs: (
    inputsDefs: SocketDefs<NodeInputs>,
    inputs: SocketMetas<NodeInputs>,
    contextInputDefs: SocketDefs<{}>,
    contextInputs: SocketMetas<{}>,
    form: FormValues<NodeForm>,
    reqContext: ApolloContext
  ) => Promise<SocketDefs<ContextResults>>;
}

export interface ConnectionDescription {
  name: string;
  connectionId: string;
}

export interface NodeInstance {
  id: string;
  x: number;
  y: number;
  workspaceId: string;
  contextIds: Array<string>;
  outputs: Array<ConnectionDescription>;
  inputs: Array<ConnectionDescription>;
  variables: SocketDefs<{}>;
  type: string;
  form: Array<FormValue>;
  state: NodeState;
}

export interface GQLNodeInstance extends NodeInstance {
  state: NodeState;
  metaInputs: string;
  metaOutputs: string;
  hasContextFn: boolean;
  progress: number | null;
  inputSockets: string;
  outputSockets: string;
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
