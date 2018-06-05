import { Db } from 'mongodb';

import { SocketDefs, SocketMetas } from './sockets';

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

export interface NodeDef<NodeInputs = {}, NodeOutputs = {}> {
  name: string;
  inputs: SocketDefs<NodeInputs>;
  outputs: SocketDefs<NodeOutputs>;
  isOutputNode?: boolean;
  supportsDynamicSockets?: boolean;
  path: Array<string>;
  keywords: Array<string>;
}

export interface NodeExecutionResult<NodeOutputs, NodeResults = {}> {
  outputs: IOValues<NodeOutputs>;
  results?: IOValues<NodeResults>;
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
  onMetaExecution: (
    form: FormValues<NodeForm>,
    inputs: SocketMetas<NodeInputs>,
    db: Db
  ) => Promise<SocketMetas<NodeOutputs>>;
}

export interface ServerNodeDefWithContextFn<
  NodeInputs = {},
  NodeOutputs = {},
  NodeForm = {},
  NodeResults = {}
> extends ServerNodeDef<NodeInputs, NodeOutputs, NodeForm, NodeResults> {
  onServerExecution: (
    form: FormValues<NodeForm>,
    inputs: IOValues<NodeInputs>,
    db: Db,
    context?: {
      nodeId: string;
      onContextFnExecution: (
        input: IOValues<any>
      ) => Promise<NodeExecutionResult<any>>;
    }
  ) => Promise<NodeExecutionResult<NodeOutputs, NodeResults>>;
  transformInputDefsToContextInputDefs: (
    inputsDefs: SocketDefs<NodeInputs>,
    inputs: SocketMetas<NodeInputs>,
    db: Db
  ) => Promise<SocketDefs<{}>>;
  transformContextInputDefsToContextOutputDefs: (
    inputsDefs: SocketDefs<NodeInputs>,
    inputs: SocketMetas<NodeInputs>,
    contextInputDefs: SocketDefs<{}>,
    contextInputs: SocketMetas<{}>,
    db: Db
  ) => Promise<SocketDefs<{}>>;
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
  metaInputs: string;
  metaOutputs: string;
  hasContextFn: boolean;
  contextInputDefs: string | null;
  contextOutputDefs: string | null;
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
