import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  parseNodeForm,
  SocketMetaDef,
  SocketMetas,
  SocketState
} from '@masterthesis/shared';

import { tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetNode } from '../workspace/nodes';
import { getInputDefs, tryGetParentNode } from '../workspace/nodes-detail';
import { InMemoryCache } from './inmemory-cache';

export const getMetaInputs = async (
  node: NodeInstance,
  reqContext: ApolloContext,
  cache: InMemoryCache = new InMemoryCache()
) => {
  const inputDefs = await getInputDefs(node, reqContext, cache);
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

      const conn = await cache.tryGetOrFetch(connection.connectionId, () =>
        tryGetConnection(connection.connectionId, reqContext)
      );
      const inputNode = await cache.tryGetOrFetch(conn.from.nodeId, () =>
        tryGetNode(conn.from.nodeId, reqContext)
      );
      const metaOutputsFromInput = await getMetaOutputs(
        inputNode,
        reqContext,
        cache
      );
      inputs[connection.name] = metaOutputsFromInput[conn.from.name];
    })
  );

  return inputs;
};

export const getMetaOutputs = async (
  node: NodeInstance,
  reqContext: ApolloContext,
  cache: InMemoryCache = new InMemoryCache()
): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> => {
  if (node.type === ContextNodeType.INPUT) {
    return await getDynamicContextInputMetas(node, reqContext, cache);
  } else if (node.type === ContextNodeType.OUTPUT) {
    return {};
  }

  const nodeType = tryGetNodeType(node.type);
  const allInputs = await getMetaInputs(node, reqContext, cache);
  return await nodeType.onMetaExecution(
    parseNodeForm(node.form),
    allInputs,
    reqContext
  );
};

const getDynamicContextInputMetas = async (
  node: NodeInstance,
  reqContext: ApolloContext,
  cache: InMemoryCache
) => {
  const parent = await tryGetParentNode(node, reqContext, cache);
  const parentType = await tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    throw new Error('Should have context fn');
  }

  const [parentInputDefs, parentMetaInputs] = await Promise.all([
    getInputDefs(parent, reqContext, cache),
    getMetaInputs(parent, reqContext, cache)
  ]);

  const dynContextDefs = await parentType.transformInputDefsToContextInputDefs(
    parentInputDefs,
    parentMetaInputs,
    parseNodeForm(parent.form),
    reqContext
  );

  const res = {};
  Object.keys(dynContextDefs).forEach(e => {
    res[e] = {
      content: {},
      isPresent: true
    };
  });
  Object.entries(parentInputDefs)
    .filter(n => n[1].state === SocketState.VARIABLE)
    .forEach(c => {
      res[c[0]] = parentMetaInputs[c[0]];
    });

  return res;
};
