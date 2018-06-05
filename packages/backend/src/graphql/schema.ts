import { SocketMetas } from '@masterthesis/shared';
import { GraphQLUpload } from 'apollo-upload-server';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { Db } from 'mongodb';

import { createBirthdaysDemoData } from '../examples/birthdays';
import { createSTRDemoData } from '../examples/str';
import {
  getAllCalculations,
  startCalculation
} from '../main/calculation/start-process';
import {
  createConnection,
  deleteConnection,
  getAllConnections
} from '../main/workspace/connections';
import {
  addValueSchema,
  createDataset,
  deleteDataset,
  getAllDatasets,
  getDataset
} from '../main/workspace/dataset';
import {
  createEntryFromJSON,
  deleteEntry,
  getEntriesCount,
  getLatestEntries
} from '../main/workspace/entry';
import {
  addOrUpdateFormValue,
  createNode,
  deleteNode,
  getAllNodes,
  getNodeMetaInputs,
  getNodeMetaOutputs,
  getNodeState,
  updateNode
} from '../main/workspace/nodes';
import { getAllUploads, uploadEntriesCsv } from '../main/workspace/upload';
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspace,
  updateWorkspace
} from '../main/workspace/workspace';
import CalculationProcess from './schemas/calculation';
import Dataset from './schemas/dataset';
import Entry from './schemas/entry';
import UploadProcess from './schemas/upload';
import Valueschema from './schemas/valueschema';
import Workspace from './schemas/workspace';

export interface ApolloContext {
  db: Db;
}

export const Query = `
  type Query {
    datasets: [Dataset!]!
    workspace(id: String!): Workspace
    workspaces: [Workspace!]!
    dataset(id: String!): Dataset
    entry(datasetId: String!, entryId: String!): Entry
    uploads(datasetId: String): [UploadProcess!]!
    calculations(workspaceId: String!): [CalculationProcess!]!
  }
`;

export const Mutation = `
  type Mutation {
    createDataset (
      name: String!
    ): Dataset!
    deleteDataset (
      id: String!
    ): Boolean!
    addValueSchema (
      datasetId: String!
      name: String!
      type: String!
      required: Boolean!
      fallback: String!
      unique: Boolean!
    ): Boolean!
    addEntry (
      datasetId: String!
      values: String!
    ): Entry!
    deleteEntry (
      datasetId: String!
      entryId: String!
    ): Boolean!
    createConnection (
      input: ConnectionInput!
    ): Connection!
    createNode (
      type: String!
      workspaceId: String!
      contextIds: [String!]!
      x: Float!
      y: Float!
    ): Node!
    deleteConnection (
      id: String!
    ): Boolean!
    deleteNode (
      id: String!
    ): Boolean!
    updateNode (
      id: String!
      x: Float!
      y: Float!
    ): Boolean!
    addOrUpdateFormValue (
      nodeId: String!
      name: String!
      value: String!
    ): Boolean!
    createWorkspace (
      name: String!
      description: String
    ): Workspace!
    deleteWorkspace (
      id: String!
    ): Boolean!
    updateWorkspace (
      id: String!
      nodes: [NodeInput!]!
      connections: [ConnectionInput!]!
    ): Boolean!
    createSTRDemoData: Boolean!
    createBirthdaysDemoData: Boolean!
    uploadEntriesCsv (files: [Upload!]!, datasetId: String!): UploadProcess!
    startCalculation (workspaceId: String!): CalculationProcess!
  }
`;

export const SchemaDefinition = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

const resolvers: IResolvers<any, ApolloContext> = {
  Query: {
    datasets: (_, __, { db }) => getAllDatasets(db),
    dataset: (_, { id }, { db }) => getDataset(db, id),
    entry: (_, {}) => null,
    workspaces: (_, __, { db }) => getAllWorkspaces(db),
    workspace: (_, { id }, { db }) => getWorkspace(db, id),
    uploads: (_, { datasetId }, { db }) => getAllUploads(db, datasetId),
    calculations: (_, { workspaceId }, { db }) =>
      getAllCalculations(db, workspaceId)
  },
  Entry: {
    values: ({ values }) => JSON.stringify(values)
  },
  Dataset: {
    entriesCount: ({ _id }, __, { db }) => getEntriesCount(db, _id),
    latestEntries: ({ _id }, __, { db }) => getLatestEntries(db, _id)
  },
  UploadProcess: {
    errors: ({ errors }) =>
      Object.keys(errors).map(name => ({
        name,
        message: errors[name].message,
        count: errors[name].count
      }))
  },
  Node: {
    state: node => getNodeState(node),
    workspace: ({ workspaceId }, __, { db }) => getWorkspace(db, workspaceId),
    metaOutputs: ({ id }, _, { db }) => getNodeMetaOutputs(db, id),
    metaInputs: ({ id, inputs }, _, { db }) => getNodeMetaInputs(db, id, inputs)
  },
  Workspace: {
    nodes: ({ id }, __, { db }) => getAllNodes(db, id),
    connections: ({ id }, __, { db }) => getAllConnections(db, id)
  },
  Mutation: {
    createDataset: (_, { name }, { db }) => createDataset(db, name),
    addValueSchema: (
      _,
      { datasetId, name, type, required, fallback, unique },
      { db }
    ) =>
      addValueSchema(db, datasetId, {
        name,
        type,
        required,
        fallback,
        unique
      }),
    addEntry: (_, { datasetId, values }, { db }) =>
      createEntryFromJSON(db, datasetId, values),
    deleteDataset: (_, { id }, { db }) => deleteDataset(db, id),
    deleteEntry: (_, { entryId, datasetId }, { db }) =>
      deleteEntry(db, datasetId, entryId),
    uploadEntriesCsv: (obj, { files, datasetId }, { db }) =>
      uploadEntriesCsv(db, files, datasetId),
    createSTRDemoData: (_, {}, { db }) => createSTRDemoData(db),
    createBirthdaysDemoData: (_, {}, { db }) => createBirthdaysDemoData(db),
    createNode: (_, { type, x, y, workspaceId, contextIds }, { db }) =>
      createNode(db, type, workspaceId, contextIds, x, y),
    updateNode: (_, { id, x, y }, { db }) => updateNode(db, id, x, y),
    deleteNode: (_, { id }, { db }) => deleteNode(db, id),
    addOrUpdateFormValue: (_, { nodeId, name, value }, { db }) =>
      addOrUpdateFormValue(db, nodeId, name, value),
    createConnection: (_, { input }, { db }) =>
      createConnection(db, input.from, input.to),
    deleteConnection: (_, { id }, { db }) => deleteConnection(db, id),
    updateWorkspace: (_, { id, nodes, connections }, { db }) =>
      updateWorkspace(db, id, nodes, connections),
    createWorkspace: (_, { name, description }, { db }) =>
      createWorkspace(db, name, description),
    deleteWorkspace: (_, { id }, { db }) => deleteWorkspace(db, id),
    startCalculation: (_, { workspaceId }, { db }) =>
      startCalculation(db, workspaceId)
  },
  Upload: GraphQLUpload,
  Meta: {
    name: 'Meta',
    description: 'Date custom scalar type',
    parseValue(value: string) {
      return JSON.parse(value);
    },
    serialize(value: SocketMetas<any>) {
      return JSON.stringify(value);
    },
    parseLiteral(ast) {
      if (ast.kind === 'StringValue') {
        return JSON.parse(ast.value);
      }

      return null;
    }
  }
};

const typeDefs = [
  SchemaDefinition,
  Query,
  Mutation,
  UploadProcess,
  Entry,
  Workspace,
  Dataset,
  Valueschema,
  CalculationProcess
];

export default makeExecutableSchema<ApolloContext>({
  typeDefs,
  resolvers
}) as any;
