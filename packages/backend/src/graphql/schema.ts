import { makeExecutableSchema } from 'graphql-tools';
import * as uuid from 'uuid/v4';
import { Types } from 'mongoose';

import { DatasetModel } from './models/dataset';
import { EntryModel } from './models/entry';
import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
import Entry from './schemas/entry';

export const Query = `
  type Query {
    datasets: [Dataset!]!
    dataset(id: String!): Dataset
    entry(id: String!): Entry
  }
`;

export const Mutation = `
  type Mutation {
    createDataset (
      name: String!
    ): Dataset!
    addValueSchema (
      datasetId: String!
      name: String!
      type: String!
      required: Boolean!
    ): Dataset!
    addEntry (
      datasetId: String!
      time: String!
      values: String!
    ): Entry!
  }
`;

export const SchemaDefinition = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

const getDataset = async (id: string) => {
  const isValidId = Types.ObjectId.isValid(id);
  if (!isValidId) {
    throw new Error('Invalid Dataset ID');
  }

  const ds = await DatasetModel.findById(id).exec();
  if (!ds) {
    throw new Error('Invalid Dataset ID');
  }

  return ds;
};

const resolvers = {
  Query: {
    datasets: async () => {
      const datasets = await DatasetModel.find().exec();
      if (!datasets) {
        throw new Error('Datasets not found.');
      }
      return datasets;
    },
    dataset: async (_, { id }) => getDataset(id),
    entry: async (_, { id }) => {
      const isValidId = Types.ObjectId.isValid(id);
      if (!isValidId) {
        return null;
      }
      const e = await EntryModel.findById(id).exec();
      if (!e) {
        return null;
      }

      return e;
    }
  },
  Mutation: {
    createDataset: async (_, { name }) => {
      const dataset = await DatasetModel.create({
        name,
        valueschemas: []
      });
      if (!dataset) {
        throw new Error('Datasets not found.');
      }
      return dataset;
    },
    addValueSchema: async (_, { datasetId, name, type, required }) => {
      const ds = await getDataset(datasetId);
      ds.valueschemas.push({
        name,
        type,
        required
      });
      return await DatasetModel.findByIdAndUpdate(datasetId, ds).exec();
    },
    addEntry: async (_, { datasetId, time, values }) => {
      const ds = await getDataset(datasetId);
      ds.entries.push({
        time,
        values
      });
      return await DatasetModel.findByIdAndUpdate(datasetId, ds).exec();
    }
  }
};

const typeDefs = [SchemaDefinition, Query, Mutation, Dataset, Valueschema];

export default makeExecutableSchema({
  typeDefs,
  resolvers,
  allowUndefinedInResolve: false
});
