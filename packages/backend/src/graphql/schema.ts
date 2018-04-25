import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import * as uuid from 'uuid/v4';
import { GraphQLUpload } from 'apollo-upload-server';
import * as fs from 'fs';
import * as fastCsv from 'fast-csv';

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
import { Db, ObjectID } from 'mongodb';

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
    importEntriesAsCSV(
      datasetId: String!
      csv: String!
    ): [Entry!]!
    singleUpload (file: Upload!): Boolean!
    multipleUpload (files: [Upload!]!): Boolean!
  }
`;

export const SchemaDefinition = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

export const Upload = `scalar Upload`;

const processUpload = async upload => {
  const { stream, filename, mimetype, encoding } = await upload;
  const status = await storeFS({ stream, filename });
  console.log('Import finished');
};

const storeFS = ({ stream, filename }) => {
  return new Promise((resolve, reject) => {
    const csvStream = fastCsv()
      .on('data', data => {
        console.log(data);
      })
      .on('end', () => {
        console.log('done');
        resolve();
      });
    stream.pipe(csvStream);
  });
};

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
    importEntriesAsCSV: (_, { datasetId, csv }) => {
      //
    },
    singleUpload: (obj, { file }) => processUpload(file),
    multipleUpload: (obj, { file }) => {
      return true;
    }
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
