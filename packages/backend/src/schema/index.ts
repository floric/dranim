import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-schema-tools';

/* tslint:disable:no-var-requires */
const modules = [require('./modules/main')];

const mainDefs = [
  `schema {
        query: Query,
        mutation: Mutation
    }
`
];

const resolvers = modules.map(m => m.resolver).filter(res => !!res);
const typeDefs = mainDefs.concat(
  modules.map(m => m.typeDef).filter(res => !!res)
);

const Schema: GraphQLSchema = makeExecutableSchema({
  resolvers,
  typeDefs
});

export { Schema };
