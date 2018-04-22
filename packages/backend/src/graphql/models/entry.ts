import * as mongoose from 'mongoose';
import { Types, Document } from 'mongoose';
import { BSON } from 'bson';

export const entrySchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  },
  values: {
    type: String,
    required: true
  }
});

export interface Entry {
  time: Date;
  values: string;
}

export const EntryModel = mongoose.model<Entry & Document>(
  'Entries',
  entrySchema
);
