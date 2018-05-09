export const DATASET_TYPE = 'Dataset';
export const NUMBER_TYPE = 'Number';
export const STRING_TYPE = 'String';
export type DataType = 'Dataset' | 'Number' | 'String';

export interface SocketDef {
  dataType: DataType;
  name: string;
}

export const DataSocket = (name: string): SocketDef => ({
  dataType: DATASET_TYPE,
  name
});

export const NumberSocket = (name: string): SocketDef => ({
  dataType: NUMBER_TYPE,
  name
});

export const StringSocket = (name: string): SocketDef => ({
  dataType: STRING_TYPE,
  name
});
