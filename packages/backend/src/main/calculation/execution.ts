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

import { Log } from '../../logging';
import { tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetContextNode, tryGetNode } from '../workspace/nodes';
import { areNodeInputsValid } from './validation';

export const executeNodeWithId = async (
  nodeId: string,
  processId: string,
  reqContext: ApolloContext,
  contextInputs?: IOValues<any>
) => {
  const node = await tryGetNode(nodeId, reqContext);
  return await executeNode(node, processId, reqContext, contextInputs);
};

export const executeNode = async (
  node: NodeInstance,
  processId: string,
  reqContext: ApolloContext,
  contextInputs: IOValues<any> = {},
  cache: Map<string, any> = new Map()
): Promise<NodeExecutionResult<{}, any>> => {
  if (node.type === ContextNodeType.INPUT) {
    if (!contextInputs) {
      throw new Error('Context needs context inputs');
    }
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
  const outputNode = cache.has('contextOutputNode')
    ? cache.get('contextOutputNode')
    : await tryGetContextNode(node, ContextNodeType.OUTPUT, reqContext);
  if (!cache.has('contextOutputNode')) {
    cache.set('contextOutputNode', outputNode);
  }

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
  const conn = cache.has(i.connectionId)
    ? cache.get(i.connectionId)
    : await tryGetConnection(i.connectionId, reqContext);
  if (!cache.has(i.connectionId)) {
    cache.set(i.connectionId, conn);
  }
  const inputNode = cache.has(conn.from.nodeId)
    ? cache.get(conn.from.nodeId)
    : await tryGetNode(conn.from.nodeId, reqContext);
  if (!cache.has(conn.from.nodeId)) {
    cache.set(conn.from.nodeId, inputNode);
  }
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
  inputValues.forEach(i => {
    inputs[i.socketName] = i.value;
  });
  return inputs;
};
