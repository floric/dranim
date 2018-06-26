import {
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  parseNodeForm,
  SocketMetaDef,
  SocketMetas
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getNodeType, tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetNode } from '../workspace/nodes';
import { getInputDefs, tryGetParentNode } from '../workspace/nodes-detail';

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
  if (node.type === ContextNodeType.INPUT) {
    const parent = await tryGetParentNode(node, db);
    const parentType = await tryGetNodeType(parent.type);
    if (!hasContextFn(parentType)) {
      throw new Error('Should have context fn');
    }

    const dynContextDefs = await parentType.transformInputDefsToContextInputDefs(
      await getInputDefs(parent, db),
      await getMetaInputs(parent, db),
      db
    );

    const res = {};
    Object.keys(dynContextDefs).forEach(e => {
      res[e] = {
        content: {},
        isPresent: true
      };
    });
    return res;
  }

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
