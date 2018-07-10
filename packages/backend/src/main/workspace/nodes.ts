import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  NodeState,
  ServerNodeDef
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { Logger } from '../../logging';
import { getNodeType, tryGetNodeType } from '../nodes/all-nodes';
import { deleteConnection, deleteConnectionsInContext } from './connections';
import { updateStates } from './nodes-state';
import { getWorkspace, updateLastChange } from './workspace';

export const getNodesCollection = (
  db: Db
): Collection<NodeInstance & { _id: ObjectID }> => db.collection('Nodes');

export const createNode = async (
  type: string,
  workspaceId: string,
  contextNodeIds: Array<string>,
  x: number,
  y: number,
  reqContext: ApolloContext
): Promise<NodeInstance> => {
  const nodeType = tryGetNodeType(type);

  await checkNoOutputNodeInContexts(type, contextNodeIds);
  await checkValidContextNode(contextNodeIds, reqContext);
  await checkValidWorkspace(workspaceId, reqContext);

  const collection = getNodesCollection(reqContext.db);
  const res = await collection.insertOne({
    x,
    y,
    outputs: [],
    inputs: [],
    contextIds: contextNodeIds,
    workspaceId,
    type,
    variables: {},
    state: NodeState.VALID
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing node failed');
  }

  const newNodeId = res.ops[0]._id.toHexString();

  await addContextNodesIfNecessary(
    nodeType,
    newNodeId,
    contextNodeIds,
    workspaceId,
    reqContext
  );
  await updateStates(workspaceId, reqContext);

  const { _id, ...other } = res.ops[0];

  Logger.info(`Node ${newNodeId} created`);

  return {
    id: newNodeId,
    form: [],
    ...other
  };
};

const addContextNodesIfNecessary = async (
  nodeType: ServerNodeDef,
  newNodeId: string,
  contextNodeIds: Array<string>,
  workspaceId: string,
  reqContext: ApolloContext
) => {
  if (hasContextFn(nodeType)) {
    const collection = getNodesCollection(reqContext.db);
    const nestedContextIds = [...contextNodeIds, newNodeId];
    const contextNodes = [ContextNodeType.INPUT, ContextNodeType.OUTPUT].map(
      contextType => ({
        x: contextType === ContextNodeType.INPUT ? 100 : 600,
        y: 100,
        outputs: [],
        inputs: [],
        contextIds: nestedContextIds,
        workspaceId,
        type: contextType,
        variables: {},
        state: NodeState.VALID
      })
    );

    await collection.insertMany(contextNodes);
  }
};

const checkValidContextNode = async (
  contextNodeIds: Array<string>,
  reqContext: ApolloContext
) => {
  if (contextNodeIds.length > 0) {
    const contextNode = await getNode(
      contextNodeIds[contextNodeIds.length - 1],
      reqContext
    );
    if (!contextNode) {
      throw new Error('Unknown context node');
    }
  }
};

const checkNoOutputNodeInContexts = async (
  type: string,
  contextNodeIds: Array<string>
) => {
  if (contextNodeIds.length === 0) {
    return;
  }

  const nodeType = getNodeType(type);
  if (nodeType!.isOutputNode === true) {
    throw new Error('Output nodes only on root level allowed');
  }
};

const checkValidWorkspace = async (
  workspaceId: string,
  reqContext: ApolloContext
) => {
  const ws = await getWorkspace(workspaceId, reqContext);
  if (!ws) {
    throw new Error('Unknown workspace');
  }
};

export const deleteNode = async (id: string, reqContext: ApolloContext) => {
  const nodeToDelete = await tryGetNode(id, reqContext);

  if (
    nodeToDelete.type === ContextNodeType.INPUT ||
    nodeToDelete.type === ContextNodeType.OUTPUT
  ) {
    throw new Error('Must not delete context nodes separately');
  }

  await Promise.all(
    [...nodeToDelete.inputs, ...nodeToDelete.outputs].map(c =>
      deleteConnection(c.connectionId, reqContext)
    )
  );

  await deleteConnectionsInContext(id, reqContext);

  const nodesCollection = getNodesCollection(reqContext.db);
  const res = await nodesCollection.deleteMany({
    $or: [
      { _id: new ObjectID(id) },
      { contextIds: { $elemMatch: { $eq: id } } }
    ]
  });
  if (!res || !res.deletedCount || res.deletedCount < 1) {
    throw new Error('Deleting node failed');
  }

  Logger.info(`Node ${id} deleted`);

  return true;
};

export const updateNodePosition = async (
  id: string,
  x: number,
  y: number,
  reqContext: ApolloContext
) => {
  if (!ObjectID.isValid(id)) {
    throw new Error('Invalid ID');
  }

  const collection = getNodesCollection(reqContext.db);
  const res = await collection.findOneAndUpdate(
    { _id: new ObjectID(id) },
    { $set: { x, y } }
  );

  if (res.ok !== 1) {
    throw new Error('Updating node failed');
  }

  await updateLastChange(res.value!.workspaceId, reqContext);

  return true;
};

export const getAllNodes = async (
  workspaceId: string,
  reqContext: ApolloContext
): Promise<Array<NodeInstance>> => {
  const collection = getNodesCollection(reqContext.db);
  const all = await collection.find({ workspaceId }).toArray();
  return all.map(n => {
    const valueNames = n.form ? Object.keys(n.form) : [];
    const { _id, ...other } = n;
    return {
      ...other,
      id: _id.toHexString(),
      form: valueNames.map(name => ({ name, value: n.form[name] }))
    };
  });
};

export const getNode = async (
  id: string,
  reqContext: ApolloContext
): Promise<NodeInstance | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getNodesCollection(reqContext.db);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  const valueNames = obj.form ? Object.keys(obj.form) : [];
  const { _id, ...res } = obj;

  return {
    ...res,
    id: _id.toHexString(),
    form: valueNames.map(name => ({ name, value: obj.form[name] }))
  };
};

export const tryGetNode = async (nodeId: string, reqContext: ApolloContext) => {
  const node = await getNode(nodeId, reqContext);
  if (!node) {
    throw new Error('Node not found');
  }
  return node;
};

export const resetProgress = async (
  workspaceId: string,
  reqContext: ApolloContext
) => {
  const coll = getNodesCollection(reqContext.db);
  await coll.updateMany({ workspaceId }, { $set: { progress: null } });
};

export const getContextNode = async (
  node: NodeInstance,
  type: ContextNodeType,
  reqContext: ApolloContext
): Promise<NodeInstance | null> => {
  const nodesColl = getNodesCollection(reqContext.db);
  const n = await nodesColl.findOne({
    contextIds: [...node.contextIds, node.id],
    type
  });

  if (!n) {
    return null;
  }

  const { _id, ...res } = n;

  return {
    id: _id.toHexString(),
    ...res
  };
};

export const tryGetContextNode = async (
  node: NodeInstance,
  type: ContextNodeType,
  reqContext: ApolloContext
): Promise<NodeInstance> => {
  const contextNode = await getContextNode(node, type, reqContext);
  if (!contextNode) {
    throw new Error('Unknown context node');
  }

  return contextNode;
};
