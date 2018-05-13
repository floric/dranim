export enum SocketType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export const DATASET_TYPE = 'Dataset';
export const NUMBER_TYPE = 'Number';
export const STRING_TYPE = 'String';
export type DataType = 'Dataset' | 'Number' | 'String';

export interface Socket {
  dataType: DataType;
  name: string;
}

export interface OutputSocketInformation {
  dataType: DataType;
  meta?: Array<{ name: string; info: any }>;
  isPresent?: boolean;
}

export const socketColors = new Map([
  [DATASET_TYPE, '#0099ff'],
  [NUMBER_TYPE, '#ff9900'],
  [STRING_TYPE, '#ff0099']
]);
