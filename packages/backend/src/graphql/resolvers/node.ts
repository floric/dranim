import {
  hasContextFn,
  NodeInstance,
  SocketDefs,
  SocketMetaDef,
  SocketMetas,
  Workspace
} from '@masterthesis/shared';

import {
  getMetaInputs,
  getMetaOutputs
} from '../../main/calculation/meta-execution';
import { getNodeType, hasNodeType } from '../../main/nodes/all-nodes';
import { getInputDefs, getOutputDefs } from '../../main/workspace/nodes-detail';
import { getWorkspace } from '../../main/workspace/workspace';

export const Node = {
  workspace: ({ workspaceId }, __, context): Promise<Workspace | null> =>
    getWorkspace(workspaceId, context),
  metaOutputs: (
    node,
    _,
    context
  ): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> =>
    getMetaOutputs(node, context),
  metaInputs: (
    node,
    _,
    context
  ): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> =>
    getMetaInputs(node, context),
  hasContextFn: ({ type }): boolean =>
    hasNodeType(type) ? hasContextFn(getNodeType(type)!) : false,
  inputSockets: async (
    node: NodeInstance,
    _,
    context
  ): Promise<SocketDefs<{}>> => getInputDefs(node, context),
  outputSockets: async (node, _, context): Promise<SocketDefs<{}>> =>
    getOutputDefs(node, context)
};
