import { makeExecutableSchema } from 'graphql-tools';
import * as uuid from 'uuid/v4';
import Dataset from './schemas/dataset';
import { DatasetModel } from './models/dataset';
import { Types } from 'mongoose';

export const Query = `
  type Query {
    datasets: [Dataset!]!
    dataset(id: String!): Dataset
  }
`;

export const Mutation = `
  type Mutation {
    createDataset (
      name: String!
    ): Dataset!
  }
`;

export const SchemaDefinition = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

const resolvers = {
  Query: {
    datasets: () => {
      const datasets = DatasetModel.find().exec();
      if (!datasets) {
        throw new Error('Datasets not found.');
      }
      return datasets;
    },
    dataset: (_, { id }) => {
      const isValidId = Types.ObjectId.isValid(id);
      if (!isValidId) {
        return null;
      }

      const ds = DatasetModel.findById(id).exec();
      if (!ds) {
        return null;
      }

      return ds;
    }
  },
  Mutation: {
    createDataset: (_, { name }) => {
      const dataset = DatasetModel.create({
        name,
        valueschema: '{}'
      });
      if (!dataset) {
        throw new Error('Datasets not found.');
      }
      return dataset;
    }
  }
};

const typeDefs = [SchemaDefinition, Query, Mutation, Dataset];

export default makeExecutableSchema({
  typeDefs,
  resolvers,
  allowUndefinedInResolve: false
});
