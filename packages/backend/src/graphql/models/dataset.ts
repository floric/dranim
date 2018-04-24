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
  valueschemas: [valueschemaSchema]
});

export interface Dataset {
  name: string;
  valueschemas: Array<{ name: string; required: boolean; type: string }>;
}

export interface Valueschema {
  name: string;
  required: boolean;
  type: string;
}

export interface Value extends Valueschema {
  val: string;
}

export const DatasetModel = mongoose.model<Dataset & Document>(
  'Datasets',
  datasetSchema
);
