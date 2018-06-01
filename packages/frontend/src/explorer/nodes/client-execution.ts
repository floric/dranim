import {
  ConnectionDescription,
  ConnectionInstance,
  ContextNodeType,
  NodeInstance,
  parseNodeForm,
  SocketMetaDef,
  SocketMetas
} from '@masterthesis/shared';

import { ExplorerEditorProps } from '../ExplorerEditor';
import { hasClientContextFn, nodeTypes } from './all-nodes';

const emptyOutput = {
  content: {},
  isPresent: false
};

export const getClientNodeInputs = (
  node: NodeInstance,
  state: ExplorerEditorProps
): SocketMetas<any> => {
  const nodeType = nodeTypes.get(node.type);
  let inputs: Array<ConnectionDescription> = [];

  if (nodeType || node.type === ContextNodeType.OUTPUT) {
    inputs = node.inputs;
  } else if (node.type === ContextNodeType.INPUT) {
    const parentNode = state.nodes.find(
      n => n.id === node.contextIds[node.contextIds.length - 1]
    );
    if (!parentNode) {
      throw new Error('Context node does not have parent node in state');
    }

    const parentNodeType = nodeTypes.get(parentNode.type);
    if (!parentNodeType) {
      throw new Error('Unknown node type: ' + parentNode.type);
    }
    if (!hasClientContextFn(parentNodeType)) {
      throw new Error('A');
    }

    const parentInputs = getClientNodeInputs(parentNode, state);
    const nodeForm = parseNodeForm(parentNode);

    return parentNodeType.onClientBeforeContextFnExecution(
      parentInputs,
      nodeForm,
      {
        node: parentNode,
        state
      }
    );
  } else {
    throw new Error('Should never happen');
  }

  const output = {};

  inputs
    .map<{ name: string; output: SocketMetaDef }>(i => {
      const inputSocketName = i.name;
      const inputConnection = state.connections.find(
        n =>
          n.to !== null &&
          n.to.nodeId === node.id &&
          n.to.name === inputSocketName
      );
      if (!inputConnection || inputConnection.from === null) {
        return {
          name: inputSocketName,
          output: emptyOutput
        };
      }

      const inputNode = state.nodes.find(
        n => n.id === inputConnection.from!.nodeId
      );
      if (!inputNode) {
        throw new Error('Invalid connection with unknown node.');
      }

      return getOutputOfInputSocket(
        inputNode,
        inputSocketName,
        inputConnection,
        state
      );
    })
    .forEach(v => {
      output[v.name] = v.output;
    });

  return output;
};

const getOutputOfInputSocket = (
  inputNode: NodeInstance,
  inputSocketName: string,
  inputConnection: ConnectionInstance,
  state: ExplorerEditorProps
): { name: string; output: SocketMetaDef } => {
  const inputs = getClientNodeInputs(inputNode, state);
  const nodeForm = parseNodeForm(inputNode);

  let outputs = {};

  if (inputNode.type === ContextNodeType.INPUT) {
    const parentNode = state.nodes.find(
      n => n.id === inputNode.contextIds[inputNode.contextIds.length - 1]
    );
    if (!parentNode) {
      throw new Error('Context node does not have parent node in state');
    }

    const parentNodeType = nodeTypes.get(parentNode.type);
    if (!parentNodeType) {
      throw new Error('Unknown node type: ' + parentNode.type);
    }
    if (!hasClientContextFn(parentNodeType)) {
      throw new Error('A');
    }

    const parentInputs = getClientNodeInputs(parentNode, state);
    const nodeForm2 = parseNodeForm(parentNode);
    const res = parentNodeType.onClientBeforeContextFnExecution(
      parentInputs,
      nodeForm2,
      {
        node: parentNode,
        state
      }
    );

    return {
      name: inputSocketName,
      output: res[inputConnection.from.name] || emptyOutput
    };
  }

  const nodeInputType = nodeTypes.get(inputNode.type);
  if (!nodeInputType) {
    console.error(inputSocketName);
    throw new Error('Invalid node type: ' + inputNode.type);
  }

  if (hasClientContextFn(nodeInputType)) {
    const nestedOutputNode = state.nodes.find(
      n =>
        n.contextIds[n.contextIds.length - 1] === inputNode.id &&
        n.type === ContextNodeType.OUTPUT
    );
    if (!nestedOutputNode) {
      throw new Error('Output node not found');
    }

    const nestedResult = getClientNodeInputs(nestedOutputNode, state);

    outputs = nodeInputType.onClientAfterContextFnExecution(
      nestedResult,
      inputs,
      nodeForm,
      {
        node: inputNode,
        state
      }
    );
  } else {
    outputs = nodeInputType.onClientExecution
      ? nodeInputType.onClientExecution(inputs, nodeForm, {
          state,
          node: inputNode
        })
      : {};
  }

  return {
    name: inputSocketName,
    output: outputs[inputConnection.from.name] || emptyOutput
  };
};
