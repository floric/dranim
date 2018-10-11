import {
  ApolloContext,
  CalculationProcess,
  Dataset,
  GQLPublicResults,
  UploadProcess,
  User,
  Workspace
} from '@masterthesis/shared';
import { IResolverObject } from 'graphql-tools';

import { getAllCalculations } from '../../main/calculation/start-process';
import { getPublicResults } from '../../main/dashboards/results';
import { getUser } from '../../main/users/management';
import { getAllDatasets, getDataset } from '../../main/workspace/dataset';
import { getAllUploads } from '../../main/workspace/upload';
import { getAllWorkspaces, getWorkspace } from '../../main/workspace/workspace';

export const Query: IResolverObject<any, ApolloContext> = {
  datasets: (_, __, context): Promise<Array<Dataset>> =>
    getAllDatasets(context),
  dataset: (_, { id }, context): Promise<Dataset | null> =>
    getDataset(id, context),
  entry: (_, {}) => null,
  workspaces: (_, __, context): Promise<Array<Workspace>> =>
    getAllWorkspaces(context),
  workspace: (_, { id }, context): Promise<Workspace | null> =>
    getWorkspace(id, context),
  uploads: (_, { datasetId }, context): Promise<Array<UploadProcess>> =>
    getAllUploads(datasetId, context),
  calculations: (
    _,
    { workspaceId },
    context
  ): Promise<Array<CalculationProcess>> =>
    getAllCalculations(workspaceId, context),
  user: (_, __, context): Promise<User | null> => getUser(context),
  results: (_, { workspaceId }, context): Promise<GQLPublicResults | null> =>
    getPublicResults(workspaceId, context)
};
