import { Entry } from './entry';
import * as uuid from 'uuid/v4';

export class Dataset {
  public readonly entries: Array<Entry> = [];
  public readonly id: string;
  public readonly name: string;

  constructor(name: string, id: string = uuid()) {
    this.name = name;
    this.id = id;
  }

  public addEntry(val: Entry) {
    this.entries.push(val);
  }
}
