import {
  hasContextFn,
  NodeInstance,
  NodeState,
  SocketDef,
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
import {
  getContextInputDefs,
  getContextOutputDefs,
  getNodeState
} from '../../main/workspace/nodes-detail';
import { getWorkspace } from '../../main/workspace/workspace';

export const Node = {
  state: (node: NodeInstance, _, context): Promise<NodeState> =>
    getNodeState(node, context),
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
  contextInputDefs: (
    node,
    _,
    context
  ): Promise<(SocketDefs<{}> & { [name: string]: SocketDef }) | null> =>
    getContextInputDefs(node, context),
  contextOutputDefs: (
    node,
    _,
    context
  ): Promise<(SocketDefs<{}> & { [name: string]: SocketDef }) | null> =>
    getContextOutputDefs(node, context),
  hasContextFn: ({ type }): boolean =>
    hasNodeType(type) ? hasContextFn(getNodeType(type)!) : false
};
