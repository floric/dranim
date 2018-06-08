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
import { getNode, getNodesCollection } from '../workspace/nodes';

export const executeServerNode = async (
  db: Db,
  nodeId: string,
  contextInputs?: IOValues<any>
): Promise<NodeExecutionResult<{}, {}>> => {
  const node = await getNode(db, nodeId);
  if (!node) {
    throw new Error('Node not found');
  }

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
  const nodeForm = parseNodeForm(node);

  await checkValidInputAndForm(type, nodeInputs, nodeForm);

  if (hasContextFn(type)) {
    return await calculateContext(node, type, nodeForm, nodeInputs, db);
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, { db, node });
};

const calculateContext = async (
  node: NodeInstance,
  type: ServerNodeDefWithContextFn,
  nodeForm: FormValues<any>,
  nodeInputs: IOValues<any>,
  db: Db
) => {
  const nodesColl = getNodesCollection(db);
  const outputNode = await nodesColl.findOne({
    contextIds: [...node.contextIds, node.id],
    type: ContextNodeType.OUTPUT
  });
  if (outputNode === null) {
    throw Error('Missing output node');
  }

  const inputNode = await nodesColl.findOne({
    contextIds: [...node.contextIds, node.id],
    type: ContextNodeType.INPUT
  });
  if (inputNode === null) {
    throw Error('Missing input node');
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, {
    db,
    node,
    onContextFnExecution: inputs =>
      executeServerNode(db, outputNode._id.toHexString(), inputs)
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

  const nodeRes = await executeServerNode(db, c.from.nodeId, contextInputs);

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
  type: NodeDef & ServerNodeDef,
  inputs: IOValues<{}>,
  form: FormValues<{}>
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
