import { DataType, SocketDef } from './interfaces';

export const DataSocket = (
  name: string
): SocketDef<{ schema: Array<string> }> => ({
  dataType: DataType.DATASET,
  isConnected: false,
  meta: {
    schema: []
  },
  name
});

export const NumberSocket = (name: string): SocketDef => ({
  dataType: DataType.NUMBER,
  isConnected: false,
  meta: {},
  name
});

export const StringSocket = (name: string): SocketDef => ({
  dataType: DataType.STRING,
  isConnected: false,
  meta: {},
  name
});
