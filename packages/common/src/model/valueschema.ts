export enum ValueSchemaType {
  number = 'Number',
  string = 'String',
  date = 'Date',
  boolean = 'Boolean'
}

export class ValueSchema {
  public readonly type: ValueSchemaType;
  public readonly name: string;
  public readonly required: boolean;
}
