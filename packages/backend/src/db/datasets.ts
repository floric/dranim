import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const datasetSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  schema: {
    type: String,
    required: true
  }
});

export const DatasetModel = mongoose.model('Datasets', datasetSchema);
