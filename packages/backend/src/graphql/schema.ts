import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import * as uuid from 'uuid/v4';
import { GraphQLUpload } from 'apollo-upload-server';
import { Db, ObjectID } from 'mongodb';
import * as promisesAll from 'promises-all';

import Dataset from './schemas/dataset';
import Valueschema from './schemas/valueschema';
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
    createSTRDemoData: Boolean!
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
    entriesCount: ({ _id }, __, { db }) => entriesCount(db, _id),
    latestEntries: ({ _id }, __, { db }) => latestEntries(db, _id)
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
      createEntryFromJSON(db, new ObjectID(datasetId), values),
    deleteDataset: (_, { id }, { db }) => deleteDataset(db, new ObjectID(id)),
    deleteEntry: (_, { entryId, datasetId }, { db }) =>
      deleteEntry(db, new ObjectID(datasetId), new ObjectID(entryId)),
    uploadEntriesCsv: (obj, { files, datasetId }, { db }) =>
      uploadEntriesCsv(db, files, new ObjectID(datasetId)),
    createSTRDemoData: async (_, {}, { db }) => {
      const ds = await createDataset(db, 'Passages');
      await promisesAll.all(
        passagesSchemas.map(s => addValueSchema(db, new ObjectID(ds.id), s))
      );

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

const passagesSchemas: Array<ValueSchema> = [
  { name: 'ID', type: 'String', required: true, fallback: '' },
  { name: 'pass_day', type: 'Number', required: true, fallback: '1' },
  { name: 'pass_month', type: 'Number', required: true, fallback: '1' },
  { name: 'pass_year', type: 'Number', required: true, fallback: '1' },
  { name: 'shipmaster_a', type: 'String', required: true, fallback: '' },
  { name: 'shipmaster_b', type: 'String', required: false, fallback: '' },
  { name: 'shipmaster_c', type: 'String', required: false, fallback: '' },
  { name: 'shipmaster_d', type: 'String', required: false, fallback: '' },
  { name: 'domicile_city', type: 'String', required: true, fallback: '' },
  { name: 'domicile_country_a', type: 'String', required: true, fallback: '' },
  { name: 'domicile_country_b', type: 'String', required: true, fallback: '' },
  { name: 'domicile_country_c', type: 'String', required: true, fallback: '' },
  { name: 'domicile_country_d', type: 'String', required: true, fallback: '' },
  { name: 'domicile_country_e', type: 'String', required: true, fallback: '' },
  { name: 'domicile_coords_a', type: 'String', required: true, fallback: '' },
  { name: 'domicile_coords_b', type: 'String', required: true, fallback: '' },
  {
    name: 'domicile_coords_n_int',
    type: 'Number',
    required: true,
    fallback: '0'
  },
  {
    name: 'domicile_coords_e_int',
    type: 'Number',
    required: true,
    fallback: '0'
  },
  { name: 'departure_city', type: 'String', required: true, fallback: '' },
  { name: 'departure_country_a', type: 'String', required: true, fallback: '' },
  { name: 'departure_country_b', type: 'String', required: true, fallback: '' },
  { name: 'departure_country_c', type: 'String', required: true, fallback: '' },
  { name: 'departure_country_d', type: 'String', required: true, fallback: '' },
  { name: 'departure_country_e', type: 'String', required: true, fallback: '' },
  { name: 'departure_coords_a', type: 'String', required: true, fallback: '' },
  { name: 'departure_coords_b', type: 'String', required: true, fallback: '' },
  {
    name: 'departure_coords_n_int',
    type: 'Number',
    required: true,
    fallback: '0'
  },
  {
    name: 'departure_coords_e_int',
    type: 'Number',
    required: true,
    fallback: '0'
  },
  { name: 'destination_city', type: 'String', required: true, fallback: '' },
  {
    name: 'destination_country_a',
    type: 'String',
    required: true,
    fallback: ''
  },
  {
    name: 'destination_country_b',
    type: 'String',
    required: true,
    fallback: ''
  },
  {
    name: 'destination_country_c',
    type: 'String',
    required: true,
    fallback: ''
  },
  {
    name: 'destination_country_d',
    type: 'String',
    required: true,
    fallback: ''
  },
  {
    name: 'destination_country_e',
    type: 'String',
    required: true,
    fallback: ''
  },
  {
    name: 'destination_coords_a',
    type: 'String',
    required: true,
    fallback: ''
  },
  {
    name: 'destination_coords_b',
    type: 'String',
    required: true,
    fallback: ''
  },
  {
    name: 'destination_coords_n_int',
    type: 'Number',
    required: true,
    fallback: '0'
  },
  {
    name: 'destination_coords_e_int',
    type: 'Number',
    required: true,
    fallback: '0'
  },
  { name: 'amount', type: 'Number', required: true, fallback: '1' },
  { name: 'tonnes', type: 'Number', required: true, fallback: '0' }
];
