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

import { Log } from '../../logging';
import { tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetContextNode, tryGetNode } from '../workspace/nodes';
import { areNodeInputsValid } from './validation';

export const executeNodeWithId = async (
  nodeId: string,
  processId: string,
  reqContext: ApolloContext,
  contextInputs: IOValues<any> = {}
) => {
  const node = await tryGetNode(nodeId, reqContext);
  return await executeNode(node, processId, reqContext, contextInputs);
};

const tryGetFromCache = async <T>(
  key: string,
  cache: Map<string, any>,
  fetchElementFn: () => Promise<T>
): Promise<T> => {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const res = await fetchElementFn();
  cache.set(key, res);
  return res;
};

export const executeNode = (
  node: NodeInstance,
  processId: string,
  reqContext: ApolloContext,
  contextInputs: IOValues<any> = {}
): Promise<NodeExecutionResult<{}, any>> =>
  executeNodeWithCache(node, processId, reqContext, contextInputs, new Map());

export const executeNodeWithCache = async (
  node: NodeInstance,
  processId: string,
  reqContext: ApolloContext,
  contextInputs: IOValues<any>,
  cache: Map<string, any>
): Promise<NodeExecutionResult<{}, any>> => {
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

  await validateInputs(node, nodeInputs, reqContext);

  if (node.contextIds.length === 0) {
    Log.info(`Executing node (type: ${node.type}, id: ${node.id})`);
  }

  const type = tryGetNodeType(node.type);
  if (hasContextFn(type)) {
    return await executeContext(
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
  reqContext: ApolloContext
) => {
  const execValid = await areNodeInputsValid(node, nodeInputs, reqContext);
  if (!execValid) {
    throw new Error('Execution inputs are not valid');
  }
};

const executeContext = async (
  node: NodeInstance,
  type: ServerNodeDefWithContextFn,
  nodeForm: FormValues<any>,
  nodeInputs: IOValues<any>,
  processId: string,
  reqContext: ApolloContext,
  cache: Map<string, any>
) => {
  const outputNode = await tryGetFromCache<NodeInstance>(
    `con-op-${node.id}`,
    cache,
    () => tryGetContextNode(node, ContextNodeType.OUTPUT, reqContext)
  );

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    reqContext,
    node,
    contextFnExecution: inputs =>
      executeNodeWithCache(
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
  processId: string,
  reqContext: ApolloContext,
  contextInputs: IOValues<any> = {},
  cache: Map<string, any>
) => {
  const conn = await tryGetFromCache<ConnectionInstance>(
    i.connectionId,
    cache,
    () => tryGetConnection(i.connectionId, reqContext)
  );
  const inputNode = await tryGetFromCache<NodeInstance>(
    conn.from.nodeId,
    cache,
    () => tryGetNode(conn.from.nodeId, reqContext)
  );

  const nodeRes = await executeNodeWithCache(
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
