import { Value } from './value';
import * as uuid from 'uuid/v4';

export class Entry {
  public readonly values: Map<string, Value>;
  public readonly time: Date;
  public readonly id: string;

  constructor(time: Date = new Date(), id: string = uuid()) {
    this.id = id;
    this.time = time;
    this.values = new Map();
  }

  public addVal(val: Value) {
    if (val.name.length === 0) {
      throw new Error('Invalid value.');
    }

    this.values.set(val.name, val);
  }

  public getVal(name: string) {
    const val = this.values.get(name);

    if (!val) {
      throw new Error('Invalid element.');
    }

    return val;
  }
}
