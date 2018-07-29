import { ApolloContext, SocketDefs, SocketMetas } from '@masterthesis/shared';
import { GraphQLUpload } from 'apollo-upload-server';
import { GraphQLScalarType } from 'graphql';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';

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

const resolvers: IResolvers<any, ApolloContext> = {
  Query,
  Entry,
  Dataset,
  UploadProcess,
  Node,
  Workspace,
  Mutation,
  Upload: GraphQLUpload,
  SocketDefs: new GraphQLScalarType({
    name: 'SocketDefs',
    parseValue(value: string) {
      return JSON.parse(value);
    },
    serialize(value: SocketDefs<any>) {
      return JSON.stringify(value);
    },
    parseLiteral(ast) {
      if (ast.kind === 'StringValue') {
        return JSON.parse(ast.value);
      }

      return null;
    }
  }),
  Meta: new GraphQLScalarType({
    name: 'Meta',
    parseValue(value: string) {
      return JSON.parse(value);
    },
    serialize(value: SocketMetas<any>) {
      return JSON.stringify(value);
    },
    parseLiteral(ast) {
      if (ast.kind === 'StringValue') {
        return JSON.parse(ast.value);
      }

      return null;
    }
  })
};

const typeDefs = [
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
