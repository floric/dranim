import {
  ConnectionDescription,
  FormValues,
  IOValues,
  NodeDef,
  NodeExecutionResult,
  parseNodeForm,
  ServerNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { serverNodeTypes } from '../nodes/AllNodes';
import { getConnection } from '../workspace/connections';
import { getNode } from '../workspace/nodes';

export const executeNode = async (
  db: Db,
  nodeId: string
): Promise<NodeExecutionResult<{}, {}>> => {
  const node = await getNode(db, nodeId);
  if (!node) {
    throw new Error('Node not found!');
  }

  const type = serverNodeTypes.get(node.type);
  if (!type) {
    throw new Error('Unknown node type');
  }

  const inputValues = await Promise.all(
    node.inputs.map(i => getConnectionResult(i, db))
  );

  const nodeInputs = inputValuesToObject(inputValues);
  const nodeForm = parseNodeForm(node);

  await checkValidInputAndForm(type, nodeInputs, nodeForm);

  return await type.onServerExecution(nodeForm, nodeInputs, db);
};

const getConnectionResult = async (i: ConnectionDescription, db: Db) => {
  const c = await getConnection(db, i.connectionId);
  if (!c) {
    throw new Error('Invalid connection.');
  }

  const nodeRes = await executeNode(db, c.from.nodeId);

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
    throw new Error('Invalid form.');
  }

  if (!isValidInput) {
    throw new Error('Invalid input.');
  }
};
