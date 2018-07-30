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
  ProcessState,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

import { tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetContextNode, tryGetNode } from '../workspace/nodes';
import { tryGetCalculation } from './start-process';
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
    node.inputs.map(i =>
      getConnectionResult(i, processId, reqContext, contextInputs)
    )
  );

  if (node.type === ContextNodeType.OUTPUT) {
    return getContextNodeOutputs(inputValues);
  }

  const nodeInputs = inputValuesToObject(inputValues);
  const nodeForm = parseNodeForm(node.form);

  await validateInputs(node, nodeInputs, reqContext);

  const type = tryGetNodeType(node.type);
  if (hasContextFn(type)) {
    return await executeContext(
      node,
      type,
      nodeForm,
      nodeInputs,
      processId,
      reqContext
    );
  }

  await checkForCanceledProcess(node, processId, reqContext);

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    reqContext,
    node
  });
};

const checkForCanceledProcess = async (
  node: NodeInstance,
  processId: string,
  reqContext: ApolloContext
) => {
  if (node.contextIds.length === 0) {
    const process = await tryGetCalculation(processId, reqContext);
    if (
      process.state !== ProcessState.PROCESSING &&
      process.state !== ProcessState.STARTED
    ) {
      throw new Error('Process canceled or failed');
    }
  }
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
      executeNode(outputNode, processId, reqContext, {
        ...nodeInputs,
        ...inputs
      })
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
  contextInputs?: IOValues<any>
) => {
  const conn = await tryGetConnection(i.connectionId, reqContext);
  const inputNode = await tryGetNode(conn.from.nodeId, reqContext);
  const nodeRes = await executeNode(
    inputNode,
    processId,
    reqContext,
    contextInputs
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
