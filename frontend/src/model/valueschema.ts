export enum ValueSchemaType {
  number = 'Number',
  string = 'String',
  date = 'Date'
}

export class ValueSchema {
  public readonly type: ValueSchemaType;
  public readonly name: string;
}
