import { FormComponentProps } from 'antd/lib/form';

import { FormValues, Socket } from '../graphql/resolvers/editor';
import { AllDatasetNodes } from './dataset';
import { AllNumberNodes } from './number';
import { AllStringNodes } from './string';
import { DataType, SocketDef } from './Sockets';

export interface NodeExecutionResult {
  outputs: Map<string, string>;
}

export interface NodeDef {
  title: string;
  inputs: Array<SocketDef>;
  outputs: Array<SocketDef>;
  isInputValid: (form: FormValues) => Promise<boolean>;
  onServerExecution: (form: FormValues) => Promise<NodeExecutionResult>;
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
