import {
  ApolloContext,
  ConnectionDescription,
  ConnectionInstance,
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
import { InMemoryCache } from './inmemory-cache';
import { areNodeInputsValid } from './validation';

export const executeNode = async (
  node: NodeInstance,
  processId: string,
  reqContext: ApolloContext,
  contextInputs: IOValues<any> = {},
  cache: InMemoryCache = new InMemoryCache()
): Promise<NodeExecutionResult<{}>> => {
  if (node.type === ContextNodeType.INPUT) {
    return {
      outputs: contextInputs
    };
  }

  const inputValues = await Promise.all(
    node.inputs.map(i =>
      getConnectionResult(i, processId, reqContext, contextInputs, cache)
    )
  );

  if (node.type === ContextNodeType.OUTPUT) {
    return getContextNodeOutputs(inputValues);
  }

  const nodeInputs = inputValuesToObject(inputValues);
  const nodeForm = parseNodeForm(node.form);

  await validateInputs(node, nodeInputs, reqContext, cache);

  const type = tryGetNodeType(node.type);
  if (hasContextFn(type)) {
    return await executeNodeWithContextFn(
      node,
      type,
      nodeForm,
      nodeInputs,
      processId,
      reqContext,
      cache
    );
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    reqContext,
    node
  });
};

const validateInputs = async (
  node: NodeInstance,
  nodeInputs: IOValues<{}>,
  reqContext: ApolloContext,
  cache: InMemoryCache
) => {
  const execValid = await areNodeInputsValid(
    node,
    nodeInputs,
    reqContext,
    cache
  );
  if (!execValid) {
    throw new Error('Execution inputs are not valid');
  }
};

const executeNodeWithContextFn = async (
  node: NodeInstance,
  type: ServerNodeDefWithContextFn,
  nodeForm: FormValues<any>,
  nodeInputs: IOValues<any>,
  processId: string,
  reqContext: ApolloContext,
  cache: InMemoryCache
) => {
  const outputNode = await cache.tryGetOrFetch<NodeInstance>(
    `con-op-${node.id}`,
    () => tryGetContextNode(node, ContextNodeType.OUTPUT, reqContext)
  );

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    reqContext,
    node,
    contextFnExecution: inputs =>
      executeNode(
        outputNode,
        processId,
        reqContext,
        {
          ...nodeInputs,
          ...inputs
        },
        cache
      )
  });
};

const getContextNodeOutputs = (
  inputValues: Array<{
    socketName: string;
    value: string;
  }>
) => {
  const outputs = {};
  inputValues.forEach(i => (outputs[i.socketName] = i.value));
  return {
    outputs
  };
};

const getConnectionResult = async (
  i: ConnectionDescription,
  processId: string,
  reqContext: ApolloContext,
  contextInputs: IOValues<any> = {},
  cache: InMemoryCache
) => {
  const conn = await cache.tryGetOrFetch<ConnectionInstance>(
    i.connectionId,
    () => tryGetConnection(i.connectionId, reqContext)
  );
  const inputNode = await cache.tryGetOrFetch<NodeInstance>(
    conn.from.nodeId,
    () => tryGetNode(conn.from.nodeId, reqContext)
  );

  const nodeRes = await executeNode(
    inputNode,
    processId,
    reqContext,
    contextInputs,
    cache
  );

  return { socketName: i.name, value: nodeRes.outputs[conn.from.name] };
};

const inputValuesToObject = (
  inputValues: Array<{ socketName: string; value: string }>
): IOValues<{}> => {
  const inputs = {};
  inputValues.forEach(i => (inputs[i.socketName] = i.value));
  return inputs;
};
