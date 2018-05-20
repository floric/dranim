import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import { GraphQLUpload } from 'apollo-upload-server';
import { Db } from 'mongodb';

import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
import Entry from './schemas/entry';
import UploadProcess from './schemas/upload';
import Workspace from './schemas/workspace';
import CalculationProcess from './schemas/calculation';
import {
  getAllDatasets,
  getDataset,
  createDataset,
  deleteDataset,
  addValueSchema
} from './resolvers/dataset';
import {
  createNode,
  getWorkspace,
  updateNode,
  updateWorkspace,
  createConnection,
  deleteConnection,
  deleteNode,
  addOrUpdateFormValue,
  getNodeState,
  getAllWorkspaces,
  createWorkspace,
  getAllNodes,
  getAllConnections,
  deleteWorkspace
} from './resolvers/workspace';
import {
  latestEntries,
  deleteEntry,
  createEntryFromJSON,
  entriesCount
} from './resolvers/entry';
import { getAllUploads, uploadEntriesCsv } from './resolvers/upload';
import { startCalculation, getAllCalculations } from './resolvers/calculation';
import { createSTRDemoData } from '../example/str';

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
    entry: (_, { datasetId, entryId }) => null,
    workspaces: (_, __, { db }) => getAllWorkspaces(db),
    workspace: (_, { id }, { db }) => getWorkspace(db, id),
    uploads: (_, { datasetId }, { db }) => getAllUploads(db, datasetId),
    calculations: (_, { workspaceId }, { db }) =>
      getAllCalculations(db, workspaceId)
  },
  Entry: {
    values: ({ values }, __, { db }) =>
      Object.keys(values).map(k => ({ name: k, val: values[k] }))
  },
  Dataset: {
    entriesCount: ({ _id }, __, { db }) => entriesCount(db, _id),
    latestEntries: ({ _id }, __, { db }) => latestEntries(db, _id)
  },
  UploadProcess: {
    errors: ({ errors }, __, { db }) =>
      Object.keys(errors).map(name => ({
        name,
        message: errors[name].message,
        count: errors[name].count
      }))
  },
  Node: {
    state: (node, __, { db }) => getNodeState(db, node),
    workspace: ({ workspaceId }, __, { db }) => getWorkspace(db, workspaceId)
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
    createNode: (_, { type, x, y, workspaceId }, { db }) =>
      createNode(db, type, workspaceId, x, y),
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
  Upload: GraphQLUpload
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
