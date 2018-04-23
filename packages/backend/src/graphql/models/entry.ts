import * as mongoose from 'mongoose';
import { Types, Document } from 'mongoose';

export const entrySchema = new mongoose.Schema({
  datasetId: {
    type: String,
    required: true
  }
});

export interface Entry {
  datasetId: string;
}

export const EntryModel = mongoose.model<Entry & Document>(
  'Entries',
  entrySchema
);
