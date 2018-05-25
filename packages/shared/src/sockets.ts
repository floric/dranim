import { DatasetRef } from './nodes/dataset';

export enum SocketType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export enum DataType {
  DATASET = 'Dataset',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  STRING = 'String'
}
export interface DatasetMeta {
  schema: Array<string>;
}

export interface SocketDef<Meta = {}> {
  dataType: DataType;
  displayName: string;
  order?: number;
  meta: SocketMetaDef<Meta>;
  isConnected: boolean;
}

export interface SocketMetaDef<Meta = {}> {
  isPresent: boolean;
  content: Meta;
}

export type SocketMetaContent<T> = { [Name in keyof T]: any };
export type SocketDefsGeneric<T, M extends SocketMetaContent<T>> = {
  [Name in keyof T]: SocketDef<M[Name]>
};
export type SocketMetasGeneric<T, M extends SocketMetaContent<T>> = {
  [Name in keyof T]: SocketMetaDef<M[Name]>
};
export type ConditionalMetaTypes<T> = {
  [Name in keyof T]: T[Name] extends DatasetRef ? DatasetMeta : {}
};
export type SocketDefs<T> = SocketDefsGeneric<T, ConditionalMetaTypes<T>>;
export type SocketMetas<T> = SocketMetasGeneric<T, ConditionalMetaTypes<T>>;

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
