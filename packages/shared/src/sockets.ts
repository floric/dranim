import { DatasetRef } from './nodes/dataset';
import { EntryRef } from './nodes/entries';
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
  STRING = 'String'
}

export interface DatasetMeta {
  schema: Array<ValueSchema>;
}

export interface SocketDef {
  dataType: DataType;
  displayName: string;
  isDynamic?: boolean;
}

export interface SocketMetaDef<Meta = {}> {
  isPresent: boolean;
  content: Meta;
}

export type SocketDefsGeneric<M> = { [Name in keyof M]: SocketDef } & {
  [x: string]: SocketDef;
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

export const DatasetSocket = (name: string): SocketDef => ({
  dataType: DataType.DATASET,
  displayName: name
});

export const NumberSocket = (name: string): SocketDef => ({
  dataType: DataType.NUMBER,
  displayName: name
});

export const StringSocket = (name: string): SocketDef => ({
  dataType: DataType.STRING,
  displayName: name
});

export const BooleanSocket = (name: string): SocketDef => ({
  dataType: DataType.BOOLEAN,
  displayName: name
});

export const DateSocket = (name: string): SocketDef => ({
  dataType: DataType.DATE,
  displayName: name
});
