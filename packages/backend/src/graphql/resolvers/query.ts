import {
  CalculationProcess,
  Dataset,
  UploadProcess,
  User,
  Workspace
} from '@masterthesis/shared';

import { getAllCalculations } from '../../main/calculation/start-process';
import { tryGetUser } from '../../main/users/management';
import { getAllDatasets, getDataset } from '../../main/workspace/dataset';
import { getAllUploads } from '../../main/workspace/upload';
import { getAllWorkspaces, getWorkspace } from '../../main/workspace/workspace';

export const Query = {
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
  user: (_, __, context): Promise<User> => tryGetUser(context)
};
