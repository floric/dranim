import { FormComponentProps } from 'antd/lib/form';

import { FormValues, Socket } from '../graphql/resolvers/workspace';
import { AllDatasetNodes } from './dataset';
import { AllNumberNodes } from './number';
import { AllStringNodes } from './string';
import { DataType, SocketDef } from './Sockets';
import { NumberOutputNode } from './number/OutputNode';
import { DatasetOutputNode } from './dataset/OutputNode';
import { StringOutputNode } from './string/OutputNode';

export type NodeExecutionOutputs = Map<string, string>;

export interface NodeExecutionResult {
  outputs: NodeExecutionOutputs;
}

export interface NodeDef {
  title: string;
  inputs: Array<SocketDef>;
  outputs: Array<SocketDef>;
  isFormValid?: (form: FormValues) => boolean;
  isInputValid: (inputs: NodeExecutionOutputs) => Promise<boolean>;
  onServerExecution: (
    form: FormValues,
    inputs: NodeExecutionOutputs
  ) => Promise<NodeExecutionResult>;
}

const allNodes = [AllDatasetNodes, AllNumberNodes, AllStringNodes];
export const nodeTypes: Map<string, NodeDef> = new Map(
  allNodes
    .map<Array<[string, NodeDef]>>(nodes =>
      nodes.map<[string, NodeDef]>(n => [n.title, n])
    )
    .reduce<Array<[string, NodeDef]>>(
      (list, elem, _, all) => [...list, ...elem],
      []
    )
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const outputNodes = [
  StringOutputNode,
  NumberOutputNode,
  DatasetOutputNode
].map(n => n.title);
