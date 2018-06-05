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

import { serverNodeTypes } from '../../main/nodes/all-nodes';
import {
  getContextInputDefs,
  getContextOutputDefs,
  getMetaInputs,
  getMetaOutputs,
  getNodeState
} from '../../main/workspace/nodes';
import { getWorkspace } from '../../main/workspace/workspace';

export const Node = {
  state: (node: NodeInstance): Promise<NodeState> => getNodeState(node),
  workspace: ({ workspaceId }, __, { db }): Promise<Workspace | null> =>
    getWorkspace(db, workspaceId),
  metaOutputs: (
    { id },
    _,
    { db }
  ): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> =>
    getMetaOutputs(db, id),
  metaInputs: (
    { id, inputs },
    _,
    { db }
  ): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> =>
    getMetaInputs(db, id, inputs),
  contextInputDefs: (
    node,
    _,
    { db }
  ): Promise<(SocketDefs<{}> & { [name: string]: SocketDef }) | null> =>
    getContextInputDefs(node, db),
  contextOutputDefs: (
    node,
    _,
    { db }
  ): Promise<(SocketDefs<{}> & { [name: string]: SocketDef }) | null> =>
    getContextOutputDefs(node, db),
  hasContextFn: ({ type }): boolean =>
    serverNodeTypes.has(type) ? hasContextFn(serverNodeTypes.get(type)!) : false
};
