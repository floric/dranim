import {
  CalculationProcess,
  UploadProcess,
  Workspace
} from '@masterthesis/shared';

import { getAllCalculations } from '../../main/calculation/start-process';
import {
  Dataset,
  getAllDatasets,
  getDataset
} from '../../main/workspace/dataset';
import { getAllUploads } from '../../main/workspace/upload';
import { getAllWorkspaces, getWorkspace } from '../../main/workspace/workspace';

export const Query = {
  datasets: (_, __, { db }): Promise<Array<Dataset>> => getAllDatasets(db),
  dataset: (_, { id }, { db }): Promise<Dataset | null> => getDataset(db, id),
  entry: (_, {}) => null,
  workspaces: (_, __, { db }): Promise<Array<Workspace>> =>
    getAllWorkspaces(db),
  workspace: (_, { id }, { db }): Promise<Workspace | null> =>
    getWorkspace(db, id),
  uploads: (_, { datasetId }, { db }): Promise<Array<UploadProcess>> =>
    getAllUploads(db, datasetId),
  calculations: (
    _,
    { workspaceId },
    { db }
  ): Promise<Array<CalculationProcess>> => getAllCalculations(db, workspaceId)
};
