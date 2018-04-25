import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import * as uuid from 'uuid/v4';
import { GraphQLUpload } from 'apollo-upload-server';
import { Db, ObjectID } from 'mongodb';

import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
import {
  datasets,
  dataset,
  createDataset,
  deleteDataset,
  addValueSchema
} from './resolvers/dataset';
import { createEntry, entries, deleteEntry } from './resolvers/entry';
import { uploadEntriesCsv } from './resolvers/upload';

interface ApolloContext {
  db: Db;
}

export const Query = `
  type Query {
    datasets: [Dataset!]!
    dataset(id: String!): Dataset
    entry(datasetId: String!, entryId: String!): Entry
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
    ): Boolean!
    addEntry (
      datasetId: String!
      values: String!
    ): Entry!
    deleteEntry (
      datasetId: String!
      entryId: String!
    ): Boolean!
    uploadEntriesCsv (files: [Upload!]!, datasetId: String!): Boolean!
  }
`;

export const SchemaDefinition = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

export const Upload = `scalar Upload`;

const resolvers: IResolvers<any, ApolloContext> = {
  Query: {
    datasets: (_, __, { db }) => datasets(db),
    dataset: (_, { id }, { db }) => dataset(db, new ObjectID(id)),
    entry: (_, { datasetId, entryId }) => null
  },
  Dataset: {
    entries: ({ _id }, __, { db }) => entries(db, _id)
  },
  Mutation: {
    createDataset: (_, { name }, { db }) => createDataset(db, name),
    addValueSchema: async (
      _,
      { datasetId, name, type, required, fallback },
      { db }
    ) =>
      addValueSchema(db, new ObjectID(datasetId), {
        name,
        type,
        required,
        fallback
      }),
    addEntry: (_, { datasetId, values }, { db }) =>
      createEntry(db, new ObjectID(datasetId), values),
    deleteDataset: (_, { id }, { db }) => deleteDataset(db, new ObjectID(id)),
    deleteEntry: (_, { entryId, datasetId }, { db }) =>
      deleteEntry(db, new ObjectID(datasetId), new ObjectID(entryId)),
    uploadEntriesCsv: (obj, { files, datasetId }, { db }) =>
      uploadEntriesCsv(db, files, new ObjectID(datasetId))
  },
  Upload: GraphQLUpload
};

const typeDefs = [
  SchemaDefinition,
  Query,
  Mutation,
  Dataset,
  Valueschema,
  Upload
];

export default makeExecutableSchema<ApolloContext>({
  typeDefs,
  resolvers
});
