import {
  ConnectionInstance,
  NodeInstance,
  OutputResult
} from '@masterthesis/shared';

import { getResultsForWorkspace } from '../../main/dashboards/results';
import { getAllConnections } from '../../main/workspace/connections';
import { getAllNodes } from '../../main/workspace/nodes';

export const Workspace = {
  nodes: ({ id }, __, context): Promise<Array<NodeInstance>> =>
    getAllNodes(id, context),
  connections: ({ id }, __, context): Promise<Array<ConnectionInstance>> =>
    getAllConnections(id, context),
  results: ({ id }, __, context): Promise<Array<OutputResult>> =>
    getResultsForWorkspace(id, context)
};
