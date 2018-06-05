import { ConnectionInstance, NodeInstance } from '@masterthesis/shared';

import { getAllConnections } from '../../main/workspace/connections';
import { getAllNodes } from '../../main/workspace/nodes';

export const Workspace = {
  nodes: ({ id }, __, { db }): Promise<Array<NodeInstance>> =>
    getAllNodes(db, id),
  connections: ({ id }, __, { db }): Promise<Array<ConnectionInstance>> =>
    getAllConnections(db, id)
};
