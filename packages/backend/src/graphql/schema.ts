import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import * as uuid from 'uuid/v4';
import { GraphQLUpload } from 'apollo-upload-server';
import { Db, ObjectID } from 'mongodb';
import * as promisesAll from 'promises-all';

import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
import Entry from './schemas/entry';
import UploadResult from './schemas/upload';
import {
  datasets,
  dataset,
  createDataset,
  deleteDataset,
  addValueSchema,
  Valueschema as ValueSchema
} from './resolvers/dataset';
import {
  createEntry,
  latestEntries,
  deleteEntry,
  createEntryFromJSON,
  entriesCount
} from './resolvers/entry';
import { uploadEntriesCsv } from './resolvers/upload';
import { passagesSchemas } from '../example/str';

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
    createSTRDemoData: Boolean!
    uploadEntriesCsv (files: [Upload!]!, datasetId: String!): UploadResult!
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
    entry: (_, { datasetId, entryId }) => null
  },
  Entry: {
    values: ({ values }, __, { db }) =>
      Object.keys(values).map(k => ({ name: k, val: values[k] }))
  },
  Dataset: {
    entriesCount: ({ _id }, __, { db }) => entriesCount(db, _id),
    latestEntries: ({ _id }, __, { db }) => latestEntries(db, _id)
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
      const ds = await createDataset(db, 'Passages');
      for (const s of passagesSchemas) {
        await addValueSchema(db, new ObjectID(ds.id), s);
      }

      return true;
    }
  },
  Upload: GraphQLUpload
};

const typeDefs = [
  SchemaDefinition,
  Query,
  Mutation,
  UploadResult,
  Entry,
  Dataset,
  Valueschema
];

export default makeExecutableSchema<ApolloContext>({
  typeDefs,
  resolvers
});
