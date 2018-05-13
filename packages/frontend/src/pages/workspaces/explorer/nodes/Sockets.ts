export enum SocketType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export const DATASET_TYPE = 'Dataset';
export const NUMBER_TYPE = 'Number';
export const STRING_TYPE = 'String';
export type DataType = 'Dataset' | 'Number' | 'String';

export interface Socket {
  color: string;
  dataType: DataType;
  name: string;
}

export interface OutputSocketInformation {
  dataType: DataType;
  meta?: Array<{ name: string; info: any }>;
  isPresent?: boolean;
}

export const DataSocket = (name: string): Socket => ({
  color: '#0099ff',
  dataType: DATASET_TYPE,
  name
});

export const NumberSocket = (name: string): Socket => ({
  color: '#ff9900',
  dataType: NUMBER_TYPE,
  name
});

export const StringSocket = (name: string): Socket => ({
  color: '#ff0099',
  dataType: STRING_TYPE,
  name
});
