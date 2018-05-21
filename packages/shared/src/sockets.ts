import { DataType, SocketDef } from './interfaces';

export interface DatasetMeta {
  schema: Array<string>;
}

export const DataSocket = (name: string): SocketDef<DatasetMeta> => ({
  dataType: DataType.DATASET,
  isConnected: false,
  meta: {
    content: { schema: [] },
    isPresent: false
  },
  displayName: name
});

export const NumberSocket = (name: string): SocketDef => ({
  dataType: DataType.NUMBER,
  isConnected: false,
  meta: { content: {}, isPresent: false },
  displayName: name
});

export const StringSocket = (name: string): SocketDef => ({
  dataType: DataType.STRING,
  isConnected: false,
  meta: { content: {}, isPresent: false },
  displayName: name
});
