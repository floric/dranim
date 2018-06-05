import {
  ConnectionDescription,
  ContextNodeType,
  FormValues,
  hasContextFn,
  IOValues,
  NodeDef,
  NodeExecutionResult,
  parseNodeForm,
  ServerNodeDef
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
    const res = {};
    inputValues.forEach(i => {
      res[i.socketName] = i.value;
    });
    return {
      outputs: res
    };
  }

  const type = serverNodeTypes.get(node.type);
  if (!type) {
    throw new Error('Unknown node type');
  }

  const nodeInputs = inputValuesToObject(inputValues);
  const nodeForm = parseNodeForm(node);

  await checkValidInputAndForm(type, nodeInputs, nodeForm);

  if (hasContextFn(type)) {
    const nodesColl = getNodesCollection(db);
    const outputNode = await nodesColl.findOne({
      contextIds: [...node.contextIds, nodeId],
      type: ContextNodeType.OUTPUT
    });
    if (outputNode === null) {
      throw Error('Missing output node');
    }

    const inputNode = await nodesColl.findOne({
      contextIds: [...node.contextIds, nodeId],
      type: ContextNodeType.INPUT
    });
    if (inputNode === null) {
      throw Error('Missing input node');
    }

    return await type.onNodeExecution(nodeForm, nodeInputs, db, {
      nodeId,
      onContextFnExecution: inputs =>
        executeServerNode(db, outputNode._id.toHexString(), inputs)
    });
  }

  return await type.onNodeExecution(nodeForm, nodeInputs, db);
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
