import { Entry } from './entry';
import * as uuid from 'uuid/v4';
import { DatasetSchema } from './datasetschema';

export class Dataset {
  public readonly entries: Array<Entry>;
  public readonly schema: DatasetSchema;
  public readonly id: string;
  public readonly name: string;

  constructor(name: string, id: string = uuid()) {
    this.name = name;
    this.id = id;
    this.entries = [];
    this.schema = new DatasetSchema();
  }

  public addEntry(val: Entry) {
    this.entries.push(val);
  }
}
