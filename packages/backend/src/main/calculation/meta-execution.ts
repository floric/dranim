import {
  NodeInstance,
  parseNodeForm,
  SocketMetaDef,
  SocketMetas
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetNode } from '../workspace/nodes';
import { getInputDefs } from '../workspace/nodes-detail';

export const getMetaInputs = async (node: NodeInstance, db: Db) => {
  const inputDefs = await getInputDefs(node, db);
  const inputs: { [name: string]: SocketMetaDef<any> } = {};

  await Promise.all(
    Object.entries(inputDefs).map(async c => {
      const connection = node.inputs.find(i => i.name === c[0]) || null;
      if (!connection) {
        inputs[c[0]] = {
          isPresent: false,
          content: {}
        };
        return;
      }

      const conn = await tryGetConnection(connection.connectionId, db);
      const inputNode = await tryGetNode(conn.from.nodeId, db);
      inputs[connection.name] = (await getMetaOutputs(inputNode, db))[
        conn.from.name
      ];
    })
  );

  return inputs;
};

export const getMetaOutputs = async (
  node: NodeInstance,
  db: Db
): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> => {
  const nodeType = getNodeType(node.type);
  if (!nodeType) {
    return {};
  }

  const allInputs = await getMetaInputs(node, db);
  return await nodeType.onMetaExecution(
    parseNodeForm(node.form),
    allInputs,
    db
  );
};
