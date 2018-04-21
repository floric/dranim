import { GraphQLObjectType, GraphQLList } from 'graphql';
import { DatasetModel } from '../models/dataset';
import { DatasetType } from '../types/dataset';

export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    datasets: {
      type: new GraphQLList(DatasetType),
      resolve: () => {
        const datasets = DatasetModel.find().exec();
        if (!datasets) {
          throw new Error('Error');
        }
        return datasets;
      }
    }
  })
});
