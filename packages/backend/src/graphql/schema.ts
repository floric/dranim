import { makeExecutableSchema } from 'graphql-tools';
import * as uuid from 'uuid/v4';
import { Types, Schema, Document } from 'mongoose';

import { DatasetModel, Value } from './models/dataset';
import { EntryModel, Entry } from './models/entry';
import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
import { parse } from 'querystring';

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
    deleteDataset (
      id: String!
    ): Entry!
    addValueSchema (
      datasetId: String!
      name: String!
      type: String!
      required: Boolean!
    ): Dataset!
    addEntry (
      datasetId: String!
      values: String!
    ): Entry!
    deleteEntry (
      id: String!
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

const getEntry = async (id: string) => {
  const isValidId = Types.ObjectId.isValid(id);
  if (!isValidId) {
    return null;
  }
  const e = await EntryModel.findById(id).exec();
  if (!e) {
    return null;
  }

  return e;
};

const getEntryValues = (e: Entry & Document) => {
  const { _id, __v, datasetId, ...values } = e.toJSON();
  return values;
};

const getEntriesForDataset = async (datasetId: string) => {
  const entries = await EntryModel.find()
    .where('datasetId', datasetId)
    .exec();
  return entries.map(e => ({
    id: e._id,
    datasetId: e.datasetId,
    values: JSON.stringify(getEntryValues(e))
  }));
};

const resolvers = {
  Query: {
    datasets: async () => await DatasetModel.find().exec(),
    dataset: async (_, { id }) => await getDataset(id),
    entry: async (_, { id }) => await getEntry(id)
  },
  Dataset: {
    entries: async ds => await getEntriesForDataset(ds._id)
  },
  Entry: {
    dataset: async e => await getDataset(e.datasetId)
  },
  Mutation: {
    createDataset: async (_, { name }) => {
      const dataset = await DatasetModel.create({
        name,
        valueschemas: []
      });
      if (!dataset) {
        throw new Error('Creating dataset failed.');
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
    addEntry: async (_, { datasetId, values }) => {
      const ds = await getDataset(datasetId);
      if (!ds) {
        throw new Error('Unknown dataset!');
      }
      const parsedValues: Array<Value> = JSON.parse(values);
      const valuesMap = {};
      parsedValues.forEach(val => {
        const valSchema = EntryModel.schema.get(val.name);
        if (!valSchema) {
          console.log('Add new schema: ' + JSON.stringify(val));
          EntryModel.schema.add({
            [val.name]: String
          });
        }
        valuesMap[val.name] = val.val;
      });

      return await EntryModel.create({
        datasetId,
        ...valuesMap
      });
    },
    deleteDataset: async (_, { id }) => {
      const res = await DatasetModel.findByIdAndRemove(id).exec();
      if (!res) {
        throw new Error("Dataset doesn't exist");
      }

      return res;
    },
    deleteEntry: async (_, { id }) => {
      const res = await EntryModel.findByIdAndRemove(id).exec();
      if (!res) {
        throw new Error("Entry doesn't exist");
      }

      return res;
    },
    importEntriesAsCSV: async (_, { datasetId, csv }) => {
      const ds = await getDataset(datasetId);
    }
  }
};

const typeDefs = [SchemaDefinition, Query, Mutation, Dataset, Valueschema];

export default makeExecutableSchema({
  typeDefs,
  resolvers,
  allowUndefinedInResolve: false
});
