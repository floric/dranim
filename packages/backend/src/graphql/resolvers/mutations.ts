import {
  CalculationProcess,
  ConnectionInstance,
  Entry,
  NodeInstance,
  UploadProcess,
  Visualization,
  Workspace
} from '@masterthesis/shared';

import { createBirthdaysDemoData } from '../../examples/birthdays';
import { createSTRDemoData } from '../../examples/str';
import { startCalculation } from '../../main/calculation/start-process';
import {
  createVisualization,
  deleteVisualization
} from '../../main/visualizations/visualizations';
import {
  createConnection,
  deleteConnection
} from '../../main/workspace/connections';
import {
  addValueSchema,
  createDataset,
  Dataset,
  deleteDataset
} from '../../main/workspace/dataset';
import { createEntryFromJSON, deleteEntry } from '../../main/workspace/entry';
import {
  addOrUpdateFormValue,
  createNode,
  deleteNode,
  updateNode
} from '../../main/workspace/nodes';
import { uploadEntriesCsv } from '../../main/workspace/upload';
import {
  createWorkspace,
  deleteWorkspace,
  updateWorkspace
} from '../../main/workspace/workspace';

export const Mutation = {
  createDataset: (_, { name }, { db }): Promise<Dataset> =>
    createDataset(db, name),
  addValueSchema: (
    _,
    { datasetId, name, type, required, fallback, unique },
    { db }
  ): Promise<boolean> =>
    addValueSchema(db, datasetId, {
      name,
      type,
      required,
      fallback,
      unique
    }),
  addEntry: (_, { datasetId, values }, { db }): Promise<Entry> =>
    createEntryFromJSON(db, datasetId, values),
  deleteDataset: (_, { id }, { db }): Promise<boolean> => deleteDataset(db, id),
  deleteEntry: (_, { entryId, datasetId }, { db }): Promise<boolean> =>
    deleteEntry(db, datasetId, entryId),
  uploadEntriesCsv: (
    obj,
    { files, datasetId },
    { db }
  ): Promise<UploadProcess> => uploadEntriesCsv(db, files, datasetId),
  createSTRDemoData: (_, {}, { db }): Promise<boolean> => createSTRDemoData(db),
  createBirthdaysDemoData: (_, {}, { db }): Promise<boolean> =>
    createBirthdaysDemoData(db),
  createNode: (
    _,
    { type, x, y, workspaceId, contextIds },
    { db }
  ): Promise<NodeInstance> =>
    createNode(db, type, workspaceId, contextIds, x, y),
  updateNode: (_, { id, x, y }, { db }): Promise<boolean> =>
    updateNode(db, id, x, y),
  deleteNode: (_, { id }, { db }): Promise<boolean> => deleteNode(db, id),
  addOrUpdateFormValue: (
    _,
    { nodeId, name, value },
    { db }
  ): Promise<boolean> => addOrUpdateFormValue(db, nodeId, name, value),
  createConnection: (_, { input }, { db }): Promise<ConnectionInstance> =>
    createConnection(db, input.from, input.to),
  deleteConnection: (_, { id }, { db }): Promise<boolean> =>
    deleteConnection(db, id),
  updateWorkspace: (_, { id, nodes, connections }, { db }): Promise<boolean> =>
    updateWorkspace(db, id, nodes, connections),
  createWorkspace: (_, { name, description }, { db }): Promise<Workspace> =>
    createWorkspace(db, name, description),
  deleteWorkspace: (_, { id }, { db }): Promise<boolean> =>
    deleteWorkspace(db, id),
  startCalculation: (_, { workspaceId }, { db }): Promise<CalculationProcess> =>
    startCalculation(db, workspaceId),
  createVisualization: (
    _,
    { name, datasetId },
    { db }
  ): Promise<Visualization> => createVisualization(db, name, datasetId),
  deleteVisualization: (_, { id }, { db }): Promise<boolean> =>
    deleteVisualization(db, id)
};
