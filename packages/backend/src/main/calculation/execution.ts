import {
  ConnectionDescription,
  ContextNodeType,
  FormValues,
  hasContextFn,
  IOValues,
  NodeDef,
  NodeExecutionResult,
  NodeInstance,
  parseNodeForm,
  ServerNodeDef,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { serverNodeTypes } from '../nodes/all-nodes';
import { getConnection } from '../workspace/connections';
import { getNode } from '../workspace/nodes';
import { getContextNode } from '../workspace/nodes-detail';

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

  const type = serverNodeTypes.get(node.type);
  if (!type) {
    throw new Error('Unknown node type');
  }

  const nodeInputs = inputValuesToObject(inputValues);
  const nodeForm = parseNodeForm(node.form);

  await checkValidInputAndForm(node, type, nodeInputs, nodeForm, db);

  if (hasContextFn(type)) {
    return await calculateContext(node, type, nodeForm, nodeInputs, db);
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, { db, node });
};

const tryGetNode = async (nodeId: string, db: Db) => {
  const node = await getNode(db, nodeId);
  if (!node) {
    throw new Error('Node not found');
  }
  return node;
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

  const inputNode = await getContextNode(node, ContextNodeType.INPUT, db);
  if (!inputNode) {
    throw Error('Missing input node');
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    db,
    node,
    onContextFnExecution: inputs => executeNode(db, outputNode, inputs)
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
  const c = await getConnection(db, i.connectionId);
  if (!c) {
    throw new Error('Invalid connection');
  }

  const inputNode = await tryGetNode(c.from.nodeId, db);
  const nodeRes = await executeNode(db, inputNode, contextInputs);

  return { socketName: i.name, value: nodeRes.outputs[c.from.name] };
};

const inputValuesToObject = (
  inputValues: Array<{ socketName: string; value: string }>
) => {
  const inputs = {};
  inputValues.forEach(i => {
    inputs[i.socketName] = i.value;
  });
  return inputs;
};

const checkValidInputAndForm = async (
  node: NodeInstance,
  type: NodeDef & ServerNodeDef,
  inputs: IOValues<{}>,
  form: FormValues<{}>,
  db: Db
) => {
  const isValidForm = type.isFormValid ? await type.isFormValid(form) : true;
  const isValidInput = type.isInputValid
    ? await type.isInputValid(inputs)
    : true;

  if (!isValidForm) {
    throw new Error('Invalid form');
  }

  if (!isValidInput) {
    throw new Error('Invalid input');
  }
};
