import { ConnectionInstance, NodeInstance } from '@masterthesis/shared';

import { getAllConnections } from '../../main/workspace/connections';
import { getAllNodes } from '../../main/workspace/nodes';

export const Workspace = {
  nodes: ({ id }, __, context): Promise<Array<NodeInstance>> =>
    getAllNodes(id, context),
  connections: ({ id }, __, context): Promise<Array<ConnectionInstance>> =>
    getAllConnections(id, context)
};
