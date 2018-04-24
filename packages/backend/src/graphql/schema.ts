import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import * as uuid from 'uuid/v4';

import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
import {
  datasets,
  dataset,
  createDataset,
  deleteDataset,
  addValueSchema
} from './resolvers/dataset';
import { parse } from 'querystring';
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
    ): Entry!
    importEntriesAsCSV(
      datasetId: String!
      csv: String!
    ): [Entry!]!
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
  Dataset: {
    entries: () => []
  },
  Entry: {
    dataset: e => null
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
    addEntry: (_, { datasetId, values }) => {
      //
    },
    deleteDataset: (_, { id }, { db }) => deleteDataset(db, new ObjectID(id)),
    deleteEntry: (_, { entryId, datasetId }) => {
      //
    },
    importEntriesAsCSV: (_, { datasetId, csv }) => {
      //
    }
  }
};

const typeDefs = [SchemaDefinition, Query, Mutation, Dataset, Valueschema];

export default makeExecutableSchema<ApolloContext>({
  typeDefs,
  resolvers
});
