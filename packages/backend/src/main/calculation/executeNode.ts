import { Db } from 'mongodb';
import { NodeInstance, parseNodeForm } from '@masterthesis/shared';
import { serverNodeTypes } from '../nodes/AllNodes';
import { getConnection } from '../workspace/connections';
import { getNode } from '../workspace/nodes';

export const executeNode = async (db: Db, node: NodeInstance) => {
  const type = serverNodeTypes.get(node.type);
  if (!type) {
    throw new Error('Unknown node type');
  }

  // TODO define IO types for real execution
  const inputValues = await Promise.all(
    node.inputs.map(async i => {
      const c = await getConnection(db, i.connectionId);
      if (!c) {
        throw new Error('Invalid connection.');
      }

      const inputNodeId = c.from.nodeId;
      const inputNode = await getNode(db, inputNodeId);
      if (!inputNode) {
        throw new Error('Node not found!');
      }

      const nodeRes = await executeNode(db, inputNode);

      return { socketName: i.name, val: nodeRes[c.from.name] };
    })
  );

  const inputs = {};
  inputValues.forEach(i => {
    inputs[i.socketName] = i.val;
  });
  const nodeForm = parseNodeForm(node);
  const isValidForm = type.isFormValid
    ? await type.isFormValid(nodeForm)
    : true;
  const isValidInput = type.isInputValid
    ? await type.isInputValid(inputs)
    : true;
  if (!isValidForm || !isValidInput) {
    throw new Error('Invalid input or form.');
  }

  const res = await type.onServerExecution(nodeForm, inputs);

  return res.outputs;
};
