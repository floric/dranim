import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  parseNodeForm,
  SocketMetaDef,
  SocketMetas
} from '@masterthesis/shared';

import { tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from '../workspace/connections';
import { tryGetNode } from '../workspace/nodes';
import { getInputDefs, tryGetParentNode } from '../workspace/nodes-detail';

export const getMetaInputs = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  const inputDefs = await getInputDefs(node, reqContext);
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

      const conn = await tryGetConnection(connection.connectionId, reqContext);
      const inputNode = await tryGetNode(conn.from.nodeId, reqContext);
      const metaOutputsFromInput = await getMetaOutputs(inputNode, reqContext);
      inputs[connection.name] = metaOutputsFromInput[conn.from.name];
    })
  );

  return inputs;
};

export const getMetaOutputs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> => {
  if (node.type === ContextNodeType.INPUT) {
    return await getDynamicContextInputMetas(node, reqContext);
  } else if (node.type === ContextNodeType.OUTPUT) {
    return await getDynamicContextOutputMetas(node, reqContext);
  }

  const nodeType = tryGetNodeType(node.type);
  const allInputs = await getMetaInputs(node, reqContext);
  return await nodeType.onMetaExecution(
    parseNodeForm(node.form),
    allInputs,
    reqContext
  );
};

const getDynamicContextInputMetas = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  const parent = await tryGetParentNode(node, reqContext);
  const parentType = await tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    throw new Error('Should have context fn');
  }

  const dynContextDefs = await parentType.transformInputDefsToContextInputDefs(
    await getInputDefs(parent, reqContext),
    await getMetaInputs(parent, reqContext),
    parseNodeForm(node.form),
    reqContext
  );

  console.log(dynContextDefs);

  const res = {};
  Object.keys(dynContextDefs).forEach(e => {
    res[e] = {
      content: {},
      isPresent: true
    };
  });

  return res;
};

const getDynamicContextOutputMetas = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  const parent = await tryGetParentNode(node, reqContext);
  const parentType = await tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    throw new Error('Should have context fn');
  }

  const inputDefs = await getInputDefs(parent, reqContext);
  const metaInputs = await getMetaInputs(parent, reqContext);
  const contextMetaInputs = await getMetaInputs(node, reqContext);
  const form = parseNodeForm(parent.form);

  const dynContextInputDefs = await parentType.transformInputDefsToContextInputDefs(
    inputDefs,
    metaInputs,
    form,
    reqContext
  );

  const dynContextDefs = await parentType.transformContextInputDefsToContextOutputDefs(
    inputDefs,
    metaInputs,
    dynContextInputDefs,
    contextMetaInputs,
    form,
    reqContext
  );

  const res = {};
  Object.keys(dynContextDefs).forEach(e => {
    res[e] = {
      content: {},
      isPresent: true
    };
  });
  return res;
};
