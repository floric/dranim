import { DataType } from '@masterthesis/shared';

export interface SocketDef {
  dataType: DataType;
  name: string;
}

export const DataSocket = (name: string): SocketDef => ({
  dataType: DataType.DATASET,
  name
});

export const NumberSocket = (name: string): SocketDef => ({
  dataType: DataType.NUMBER,
  name
});

export const StringSocket = (name: string): SocketDef => ({
  dataType: DataType.STRING,
  name
});
