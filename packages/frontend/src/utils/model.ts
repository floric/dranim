export interface Value {
  readonly val: string;
  readonly name: string;
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
