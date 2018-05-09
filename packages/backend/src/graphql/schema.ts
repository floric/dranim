import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import { GraphQLUpload } from 'apollo-upload-server';
import { Db, ObjectID } from 'mongodb';
import * as promisesAll from 'promises-all';

import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
import Entry from './schemas/entry';
import UploadProcess from './schemas/upload';
import Editor from './schemas/editor';
import CalculationProcess from './schemas/calculation';
import {
  datasets,
  dataset,
  createDataset,
  deleteDataset,
  addValueSchema,
  Valueschema as ValueSchema
} from './resolvers/dataset';
import {
  createNode,
  editor,
  updateNode,
  updateEditor,
  createConnection,
  deleteConnection,
  deleteNode,
  addOrUpdateFormValue
} from './resolvers/editor';
import {
  createEntry,
  latestEntries,
  deleteEntry,
  createEntryFromJSON,
  entriesCount
} from './resolvers/entry';
import { uploads, uploadEntriesCsv } from './resolvers/upload';
import { startCalculation } from './resolvers/calculation';
import { passagesSchemas, commoditiesSchemas } from '../example/str';

interface ApolloContext {
  db: Db;
}

export const Query = `
  type Query {
    datasets: [Dataset!]!
    editor: Editor!
    dataset(id: String!): Dataset
    entry(datasetId: String!, entryId: String!): Entry
    uploads(datasetId: String): [UploadProcess!]!
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
    updateEditor (
      nodes: [NodeInput!]!
      connections: [ConnectionInput!]!
    ): Boolean!
    createSTRDemoData: Boolean!
    uploadEntriesCsv (files: [Upload!]!, datasetId: String!): UploadProcess!
    startCalculation: CalculationProcess!
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
    datasets: (_, __, { db }) => datasets(db),
    dataset: (_, { id }, { db }) => dataset(db, new ObjectID(id)),
    entry: (_, { datasetId, entryId }) => null,
    editor: (_, __, { db }) => editor(db),
    uploads: (_, { datasetId }, { db }) => uploads(db, datasetId)
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
    errors: ({ _id, errors }, __, { db }) =>
      Object.keys(errors).map(name => ({
        name,
        message: errors[name].message,
        count: errors[name].count
      }))
  },
  Mutation: {
    createDataset: (_, { name }, { db }) => createDataset(db, name),
    addValueSchema: async (
      _,
      { datasetId, name, type, required, fallback, unique },
      { db }
    ) =>
      addValueSchema(db, new ObjectID(datasetId), {
        name,
        type,
        required,
        fallback,
        unique
      }),
    addEntry: (_, { datasetId, values }, { db }) =>
      createEntryFromJSON(db, new ObjectID(datasetId), values),
    deleteDataset: (_, { id }, { db }) => deleteDataset(db, new ObjectID(id)),
    deleteEntry: (_, { entryId, datasetId }, { db }) =>
      deleteEntry(db, new ObjectID(datasetId), new ObjectID(entryId)),
    uploadEntriesCsv: (obj, { files, datasetId }, { db }) =>
      uploadEntriesCsv(db, files, new ObjectID(datasetId)),
    createSTRDemoData: async (_, {}, { db }) => {
      let ds = await createDataset(db, 'Passages');
      for (const s of passagesSchemas) {
        await addValueSchema(db, new ObjectID(ds.id), s);
      }
      ds = await createDataset(db, 'Commodities');
      for (const s of commoditiesSchemas) {
        await addValueSchema(db, new ObjectID(ds.id), s);
      }
      return true;
    },
    createNode: async (_, { type, x, y }, { db }) => createNode(db, type, x, y),
    updateNode: async (_, { id, x, y }, { db }) =>
      updateNode(db, new ObjectID(id), x, y),
    deleteNode: async (_, { id }, { db }) => deleteNode(db, new ObjectID(id)),
    addOrUpdateFormValue: async (_, { nodeId, name, value }, { db }) =>
      addOrUpdateFormValue(db, new ObjectID(nodeId), name, value),
    createConnection: async (_, { input }, { db }) =>
      createConnection(db, input.from, input.to),
    deleteConnection: async (_, { id }, { db }) =>
      deleteConnection(db, new ObjectID(id)),
    updateEditor: async (_, { nodes, connections }, { db }) =>
      updateEditor(db, nodes, connections),
    startCalculation: async (_, __, { db }) => startCalculation(db)
  },
  Upload: GraphQLUpload
};

const typeDefs = [
  SchemaDefinition,
  Query,
  Mutation,
  UploadProcess,
  Entry,
  Editor,
  Dataset,
  Valueschema,
  CalculationProcess
];

export default makeExecutableSchema<ApolloContext>({
  typeDefs,
  resolvers
});
