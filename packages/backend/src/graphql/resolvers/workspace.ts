import {
  ApolloContext,
  ConnectionInstance,
  NodeInstance,
  OutputResult
} from '@masterthesis/shared';
import { IResolverObject } from 'graphql-tools';

import { getResultsForWorkspace } from '../../main/dashboards/results';
import { getAllConnections } from '../../main/workspace/connections';
import { getAllNodes } from '../../main/workspace/nodes';
import { getWorkspaceState } from '../../main/workspace/workspace';

export const Workspace: IResolverObject<any, ApolloContext> = {
  nodes: ({ id }, __, context): Promise<Array<NodeInstance>> =>
    getAllNodes(id, context),
  connections: ({ id }, __, context): Promise<Array<ConnectionInstance>> =>
    getAllConnections(id, context),
  results: ({ id }, __, context): Promise<Array<OutputResult>> =>
    getResultsForWorkspace(id, context),
  state: ({ id }, __, context): Promise<string> =>
    getWorkspaceState(id, context)
};
