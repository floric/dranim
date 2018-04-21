import { DatasetType } from './dataset';
import { GraphQLNonNull, GraphQLString } from 'graphql';
import { DatasetModel } from '../models/dataset';

export const AddDatasetType = {
  type: DatasetType,
  args: {
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    valueschema: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve(root, params) {
    const uModel = new DatasetModel(params);
    const newDataset = uModel.save();
    if (!newDataset) {
      throw new Error('Error');
    }
    return newDataset;
  }
};
