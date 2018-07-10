import {
  ApolloContext,
  ConnectionDescription,
  ContextNodeType,
  FormValues,
  hasContextFn,
  IOValues,
  NodeExecutionResult,
  NodeInstance,
  parseNodeForm,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

import { tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetContextNode, tryGetNode } from '../workspace/nodes';
import { areNodeInputsValid, isNodeInMetaValid } from './validation';

export const executeNodeWithId = async (
  nodeId: string,
  reqContext: ApolloContext,
  contextInputs?: IOValues<any>
) => {
  const node = await tryGetNode(nodeId, reqContext);
  return await executeNode(node, reqContext, contextInputs);
};

export const executeNode = async (
  node: NodeInstance,
  reqContext: ApolloContext,
  contextInputs?: IOValues<any>
): Promise<NodeExecutionResult<{}>> => {
  if (node.type === ContextNodeType.INPUT) {
    if (!contextInputs) {
      throw new Error('Context needs context inputs');
    }
    return {
      outputs: contextInputs
    };
  }

  const inputValues = await Promise.all(
    node.inputs.map(i => getConnectionResult(i, reqContext, contextInputs))
  );

  if (node.type === ContextNodeType.OUTPUT) {
    return getContextNodeOutputs(inputValues);
  }

  const nodeInputs = inputValuesToObject(inputValues);
  const nodeForm = parseNodeForm(node.form);

  await validateMetaAndExecution(node, nodeInputs, reqContext);

  const type = tryGetNodeType(node.type);
  if (hasContextFn(type)) {
    return await executeContext(node, type, nodeForm, nodeInputs, reqContext);
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    reqContext,
    node
  });
};

const validateMetaAndExecution = async (
  node: NodeInstance,
  nodeInputs: IOValues<{}>,
  reqContext: ApolloContext
) => {
  const [metaValid, execValid] = await Promise.all([
    isNodeInMetaValid(node, reqContext),
    areNodeInputsValid(node, nodeInputs, reqContext)
  ]);
  if (!metaValid) {
    throw new Error('Form values or inputs are missing');
  }
  if (!execValid) {
    throw new Error('Execution inputs are not valid');
  }
};

const executeContext = async (
  node: NodeInstance,
  type: ServerNodeDefWithContextFn,
  nodeForm: FormValues<any>,
  nodeInputs: IOValues<any>,
  reqContext: ApolloContext
) => {
  const outputNode = await tryGetContextNode(
    node,
    ContextNodeType.OUTPUT,
    reqContext
  );

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    reqContext,
    node,
    contextFnExecution: inputs =>
      executeNode(outputNode, reqContext, { ...nodeInputs, ...inputs })
  });
};

const getContextNodeOutputs = (
  inputValues: Array<{
    socketName: string;
    value: string;
  }>
) => {
  const res = {};
  inputValues.forEach(i => {
    res[i.socketName] = i.value;
  });
  return {
    outputs: res
  };
};

const getConnectionResult = async (
  i: ConnectionDescription,
  reqContext: ApolloContext,
  contextInputs?: IOValues<any>
) => {
  const conn = await tryGetConnection(i.connectionId, reqContext);
  const inputNode = await tryGetNode(conn.from.nodeId, reqContext);
  const nodeRes = await executeNode(inputNode, reqContext, contextInputs);

  return { socketName: i.name, value: nodeRes.outputs[conn.from.name] };
};

const inputValuesToObject = (
  inputValues: Array<{ socketName: string; value: string }>
): IOValues<{}> => {
  const inputs = {};
  inputValues.forEach(i => {
    inputs[i.socketName] = i.value;
  });
  return inputs;
};
