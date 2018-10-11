import { ApolloContext, SocketDefs, SocketMetas } from '@masterthesis/shared';
import { GraphQLUpload } from 'apollo-server-express';
import { GraphQLScalarType, Kind } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { Dataset } from './resolvers/dataset';
import { Entry } from './resolvers/entry';
import { Mutation } from './resolvers/mutations';
import { Node } from './resolvers/node';
import { Query } from './resolvers/query';
import { UploadProcess } from './resolvers/upload-process';
import { Workspace } from './resolvers/workspace';

import CalculationProcessDef from './schemas/calculation';
import DatasetDef from './schemas/dataset';
import EntryDef from './schemas/entry';
import { MutationDef } from './schemas/mutations';
import { QueryDef } from './schemas/query';
import UploadProcessDef from './schemas/upload';
import UserDef from './schemas/user';
import ValueschemaDef from './schemas/valueschema';
import WorkspaceDef from './schemas/workspace';

export const SchemaDefinition = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

const ObjectDef = `
  scalar Object
`;

const parseValue = (value: string) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }

  return value;
};

const ObjectScalarType = new GraphQLScalarType({
  name: 'Object',
  description: 'Arbitrary object',
  parseValue,
  serialize: parseValue,
  parseLiteral: ast => {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        throw new Error(`Not sure what to do with OBJECT for ObjectScalarType`);
      default:
        return null;
    }
  }
});

const resolvers: any = {
  Object: ObjectScalarType,
  Query,
  Entry,
  Dataset,
  UploadProcess,
  Node,
  Workspace,
  Mutation,
  Upload: GraphQLUpload,
  Date: new GraphQLScalarType({
    name: 'Date',
    parseValue: (value: string) => new Date(value),
    serialize: (value: Date) => value.getTime(),
    parseLiteral: ast => (ast.kind === Kind.INT ? new Date(ast.value) : null)
  }),
  SocketDefs: new GraphQLScalarType({
    name: 'SocketDefs',
    parseValue: (value: string) => JSON.parse(value),
    serialize: (value: SocketDefs<any>) => JSON.stringify(value),
    parseLiteral: ast =>
      ast.kind === Kind.STRING ? JSON.parse(ast.value) : null
  }),
  Meta: new GraphQLScalarType({
    name: 'Meta',
    parseValue: (value: string) => JSON.parse(value),
    serialize: (value: SocketMetas<any>) => JSON.stringify(value),
    parseLiteral: ast =>
      ast.kind === Kind.STRING ? JSON.parse(ast.value) : null
  }),
  FormValues: new GraphQLScalarType({
    name: 'FormValues',
    parseValue: (value: { [key: string]: any }) => ({}),
    serialize: (value: { [key: string]: any }) => {
      const res = {};
      Object.entries(value).forEach(c => {
        res[c[0]] = JSON.parse(c[1]);
      });

      return res;
    },
    parseLiteral: () => ({})
  })
};

const typeDefs = [
  ObjectDef,
  SchemaDefinition,
  QueryDef,
  MutationDef,
  UploadProcessDef,
  EntryDef,
  WorkspaceDef,
  DatasetDef,
  ValueschemaDef,
  CalculationProcessDef,
  UserDef
];

export default makeExecutableSchema<ApolloContext>({
  typeDefs,
  resolvers
});
