import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql';

export const DatasetType = new GraphQLObjectType({
  name: 'dataset',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    valueschema: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
});
