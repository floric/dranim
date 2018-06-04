import { DatasetRef } from './nodes/dataset';
import { EntryRef } from './nodes/entry';
import { ValueSchema } from './workspace';

export enum SocketType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export enum DataType {
  DATASET = 'Dataset',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  STRING = 'String',
  ENTRY = 'Entry'
}

export interface DatasetMeta {
  schema: Array<ValueSchema>;
}

export interface SocketDef<Meta = {}> {
  dataType: DataType;
  displayName: string;
  isDynamic?: boolean;
  meta: SocketMetaDef<Meta>;
}

export interface SocketMetaDef<Meta = {}> {
  isPresent: boolean;
  content: Meta;
}

// export type SocketMetaContent<T> = { [Name in keyof T]: any };
export type SocketDefsGeneric<M> = { [Name in keyof M]: SocketDef<M[Name]> } & {
  [x: string]: SocketDef<any>;
};
export type SocketMetasGeneric<M> = {
  [Name in keyof M]: SocketMetaDef<M[Name]>
} & { [x: string]: SocketMetaDef<any> };
export type ConditionalMetaTypes<T> = {
  [Name in keyof T]: T[Name] extends DatasetRef
    ? DatasetMeta
    : (T[Name] extends EntryRef ? DatasetMeta : {})
};
export type SocketDefs<T> = SocketDefsGeneric<ConditionalMetaTypes<T>>;
export type SocketMetas<T> = SocketMetasGeneric<ConditionalMetaTypes<T>>;

export const DatasetSocket = (name: string): SocketDef<DatasetMeta> => ({
  dataType: DataType.DATASET,
  meta: {
    content: { schema: [] },
    isPresent: false
  },
  displayName: name
});

export const NumberSocket = (name: string): SocketDef => ({
  dataType: DataType.NUMBER,
  meta: { content: {}, isPresent: false },
  displayName: name
});

export const StringSocket = (name: string): SocketDef => ({
  dataType: DataType.STRING,
  meta: { content: {}, isPresent: false },
  displayName: name
});

export const BooleanSocket = (name: string): SocketDef => ({
  dataType: DataType.BOOLEAN,
  meta: { content: {}, isPresent: false },
  displayName: name
});

export const EntrySocket = (name: string): SocketDef<DatasetMeta> => ({
  dataType: DataType.ENTRY,
  meta: { content: { schema: [] }, isPresent: false },
  displayName: name
});

export const DateSocket = (name: string): SocketDef => ({
  dataType: DataType.DATE,
  meta: { content: {}, isPresent: false },
  displayName: name
});
