import { ValueSchema } from './valueschema';

export class DatasetSchema {
  public readonly entries: Map<string, ValueSchema>;
  constructor() {
    this.entries = new Map();
  }

  public addValue(val: ValueSchema) {
    const existingVal = this.entries.get(val.name);

    if (existingVal) {
      throw new Error('Schema name already used.');
    }

    this.entries.set(val.name, val);
  }
}
