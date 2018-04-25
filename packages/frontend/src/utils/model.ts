export interface Value {
  readonly val: string;
  readonly name: string;
}

export interface Entry {
  readonly id: string;
  readonly values: Array<Value>;
}

export enum ValueSchemaType {
  number = 'Number',
  string = 'String',
  date = 'Date',
  boolean = 'Boolean'
}

export interface ValueSchema {
  readonly type: ValueSchemaType;
  readonly name: string;
  readonly required: boolean;
  readonly fallback: string;
}

export interface Dataset {
  readonly id: string;
  readonly name: string;
  readonly entriesCount: number;
  readonly valueschemas: Array<ValueSchema>;
  readonly latestEntries: Array<Entry>;
}
