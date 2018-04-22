import * as mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  valueschema: {
    type: String,
    required: true
  }
});

export const DatasetModel = mongoose.model('Datasets', datasetSchema);
