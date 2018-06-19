import {
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
import { Db } from 'mongodb';

import { tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetNode } from '../workspace/nodes';
import { getContextNode } from '../workspace/nodes-detail';
import { areNodeInputsValid, isNodeInMetaValid } from './validation';

export const executeNodeWithId = async (
  db: Db,
  nodeId: string,
  contextInputs?: IOValues<any>
) => {
  const node = await tryGetNode(nodeId, db);
  return await executeNode(db, node, contextInputs);
};

export const executeNode = async (
  db: Db,
  node: NodeInstance,
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
    node.inputs.map(i => getConnectionResult(i, db, contextInputs))
  );

  if (node.type === ContextNodeType.OUTPUT) {
    return getContextNodeOutputs(inputValues);
  }

  const nodeInputs = inputValuesToObject(inputValues);
  const nodeForm = parseNodeForm(node.form);

  await validateMetaAndExecution(node, nodeInputs, db);

  const type = tryGetNodeType(node.type);
  if (hasContextFn(type)) {
    return await calculateContext(node, type, nodeForm, nodeInputs, db);
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    db,
    node
  });
};

const updateProgress = (percentage: number) => {
  // TODO
};

const validateMetaAndExecution = async (
  node: NodeInstance,
  nodeInputs: IOValues<{}>,
  db: Db
) => {
  const [metaValid, execValid] = await Promise.all([
    isNodeInMetaValid(node, db),
    areNodeInputsValid(node, nodeInputs, db)
  ]);
  if (!metaValid) {
    throw new Error('Form values or inputs are missing');
  }
  if (!execValid) {
    throw new Error('Execution inputs are not valid');
  }
};

const calculateContext = async (
  node: NodeInstance,
  type: ServerNodeDefWithContextFn,
  nodeForm: FormValues<any>,
  nodeInputs: IOValues<any>,
  db: Db
) => {
  const outputNode = await getContextNode(node, ContextNodeType.OUTPUT, db);
  if (!outputNode) {
    throw Error('Missing output node');
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    db,
    node,
    contextFnExecution: inputs => executeNode(db, outputNode, inputs),
    updateProgress
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
  db: Db,
  contextInputs?: IOValues<any>
) => {
  const conn = await tryGetConnection(i.connectionId, db);
  const inputNode = await tryGetNode(conn.from.nodeId, db);
  const nodeRes = await executeNode(db, inputNode, contextInputs);

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
