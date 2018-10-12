import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  NodeState,
  ServerNodeDef
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import { Log } from '../../logging';
import { Omit } from '../../main';
import { getNodeType, tryGetNodeType } from '../nodes/all-nodes';
import { getSafeObjectID } from '../utils';
import { deleteConnection, deleteConnectionsInContext } from './connections';
import { updateStates } from './nodes-state';
import { tryGetWorkspace, updateLastChange } from './workspace';

export const getNodesCollection = <T = NodeInstance & { _id: ObjectID }>(
  db: Db
) => db.collection<T>('Nodes');

export const createNode = async (
  type: string,
  workspaceId: string,
  contextNodeIds: Array<string>,
  x: number,
  y: number,
  reqContext: ApolloContext
): Promise<NodeInstance> => {
  const nodeType = tryGetNodeType(type);

  await Promise.all([
    checkNoOutputNodeInContexts(type, contextNodeIds),
    checkValidContextNode(contextNodeIds, reqContext),
    checkValidWorkspace(workspaceId, reqContext)
  ]);

  const collection = getNodesCollection<Omit<NodeInstance, 'id'>>(
    reqContext.db
  );
  const res = await collection.insertOne({
    x,
    y,
    outputs: [],
    inputs: [],
    form: {},
    contextIds: contextNodeIds,
    workspaceId,
    type,
    progress: null,
    variables: {},
    state: NodeState.VALID
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing node failed');
  }

  const { _id, ...other } = res.ops[0];
  const newNodeId = _id.toHexString();

  await Promise.all([
    addContextNodesIfNecessary(
      nodeType,
      newNodeId,
      contextNodeIds,
      workspaceId,
      reqContext
    ),
    updateStates(workspaceId, reqContext)
  ]);

  Log.info(`Node ${newNodeId} created`);

  return {
    id: newNodeId,
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
    const collection = getNodesCollection<Omit<NodeInstance, 'id'>>(
      reqContext.db
    );
    const nestedContextIds = [...contextNodeIds, newNodeId];
    const contextNodes = [ContextNodeType.INPUT, ContextNodeType.OUTPUT].map(
      contextType => ({
        x: contextType === ContextNodeType.INPUT ? 100 : 600,
        y: 100,
        outputs: [],
        inputs: [],
        form: {},
        contextIds: nestedContextIds,
        workspaceId,
        type: contextType,
        variables: {},
        progress: null,
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

const checkValidWorkspace = (workspaceId: string, reqContext: ApolloContext) =>
  tryGetWorkspace(workspaceId, reqContext);

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
      { _id: getSafeObjectID(id) },
      { contextIds: { $elemMatch: { $eq: id } } }
    ]
  });
  if (!res || !res.deletedCount || res.deletedCount < 1) {
    throw new Error('Deleting node failed');
  }

  Log.info(`Node ${id} deleted`);

  return true;
};

export const updateNodePosition = async (
  id: string,
  x: number,
  y: number,
  reqContext: ApolloContext
) => {
  const collection = getNodesCollection(reqContext.db);
  const res = await collection.findOneAndUpdate(
    { _id: getSafeObjectID(id) },
    { $set: { x, y } }
  );

  if (res.ok !== 1 || !res.value) {
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
    const { _id, ...other } = n;
    return {
      ...other,
      id: _id.toHexString(),
      form: n.form
    };
  });
};

export const getNode = async (
  id: string,
  reqContext: ApolloContext
): Promise<NodeInstance | null> => {
  const collection = getNodesCollection(reqContext.db);
  const obj = await collection.findOne({ _id: getSafeObjectID(id) });
  if (!obj) {
    return null;
  }

  const { _id, ...res } = obj;

  return {
    ...res,
    id: _id.toHexString(),
    form: res.form
  };
};

export const tryGetNode = async (nodeId: string, reqContext: ApolloContext) => {
  const node = await getNode(nodeId, reqContext);
  if (!node) {
    throw new Error('Node not found');
  }
  return node;
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
