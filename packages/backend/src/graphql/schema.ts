import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { QueryType } from './types/query';

import * as mutations from './types/mutation';

export const UserSchema = new GraphQLSchema({
  query: QueryType,
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: mutations
  })
});
