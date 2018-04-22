import * as mongoose from 'mongoose';
import { Types, Document } from 'mongoose';
import { entrySchema, Entry } from './entry';

const valueschemaSchema = new mongoose.Schema({
  name: String,
  required: Boolean,
  type: String
});

const datasetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  valueschemas: [valueschemaSchema],
  entries: [entrySchema]
});

export interface Dataset {
  name: string;
  valueschemas: Array<{ name: string; required: boolean; type: string }>;
  entries: Array<Entry>;
}

export const DatasetModel = mongoose.model<Dataset & Document>(
  'Datasets',
  datasetSchema
);
