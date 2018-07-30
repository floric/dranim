import {
  ApolloContext,
  CalculationProcess,
  ConnectionInstance,
  Dataset,
  Entry,
  NodeInstance,
  UploadProcess,
  Workspace
} from '@masterthesis/shared';
import { IResolverObject } from 'graphql-tools';

import { createBirthdaysDemoData } from '../../examples/birthdays';
import { createSTRDemoData } from '../../examples/str';
import {
  startCalculation,
  stopCalculation
} from '../../main/calculation/start-process';
import {
  createConnection,
  deleteConnection
} from '../../main/workspace/connections';
import {
  addValueSchema,
  createDataset,
  deleteDataset
} from '../../main/workspace/dataset';
import { createEntryFromJSON, deleteEntry } from '../../main/workspace/entry';
import {
  createNode,
  deleteNode,
  updateNodePosition
} from '../../main/workspace/nodes';
import { addOrUpdateFormValue } from '../../main/workspace/nodes-detail';
import { uploadEntriesCsv } from '../../main/workspace/upload';
import {
  createWorkspace,
  deleteWorkspace,
  updateWorkspace
} from '../../main/workspace/workspace';

export const Mutation: IResolverObject<any, ApolloContext> = {
  createDataset: (_, { name }, context): Promise<Dataset> =>
    createDataset(name, context),
  addValueSchema: (
    _,
    { datasetId, name, type, required, fallback, unique },
    context
  ): Promise<boolean> =>
    addValueSchema(
      datasetId,
      {
        name,
        type,
        required,
        fallback,
        unique
      },
      context
    ),
  addEntry: (_, { datasetId, values }, context): Promise<Entry> =>
    createEntryFromJSON(datasetId, values, context),
  deleteDataset: (_, { id }, context): Promise<boolean> =>
    deleteDataset(id, context),
  deleteEntry: (_, { entryId, datasetId }, context): Promise<boolean> =>
    deleteEntry(datasetId, entryId, context),
  uploadEntriesCsv: (
    obj,
    { files, datasetId },
    context
  ): Promise<UploadProcess> => uploadEntriesCsv(files, datasetId, context),
  createSTRDemoData: (_, {}, context): Promise<boolean> =>
    createSTRDemoData(context),
  createBirthdaysDemoData: (_, {}, context): Promise<boolean> =>
    createBirthdaysDemoData(context),
  createNode: (
    _,
    { type, x, y, workspaceId, contextIds },
    context
  ): Promise<NodeInstance> =>
    createNode(type, workspaceId, contextIds, x, y, context),
  updateNodePosition: (_, { id, x, y }, context): Promise<boolean> =>
    updateNodePosition(id, x, y, context),
  deleteNode: (_, { id }, context): Promise<boolean> => deleteNode(id, context),
  addOrUpdateFormValue: (
    _,
    { nodeId, name, value },
    context
  ): Promise<boolean> => addOrUpdateFormValue(nodeId, name, value, context),
  createConnection: (_, { input }, context): Promise<ConnectionInstance> =>
    createConnection(input.from, input.to, context),
  deleteConnection: (_, { id }, context): Promise<boolean> =>
    deleteConnection(id, context),
  updateWorkspace: (_, { id, nodes, connections }, context): Promise<boolean> =>
    updateWorkspace(id, nodes, connections, context),
  createWorkspace: (_, { name, description }, context): Promise<Workspace> =>
    createWorkspace(name, context, description),
  deleteWorkspace: (_, { id }, context): Promise<boolean> =>
    deleteWorkspace(id, context),
  startCalculation: (
    _,
    { workspaceId },
    context
  ): Promise<CalculationProcess> => startCalculation(workspaceId, context),
  stopCalculation: (_, { id }, context): Promise<boolean> =>
    stopCalculation(id, context)
};
