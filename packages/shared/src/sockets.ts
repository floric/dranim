import { DatasetRef } from './node-defs/dataset';
import { EntryRef } from './node-defs/entries';
import { ValueSchema } from './workspace';

export enum SocketType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export enum DataType {
  DATASET = 'Table',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATETIME = 'Datetime',
  TIME = 'Time',
  STRING = 'String',
  VIS = 'Vis',
  ANY = 'Any'
}

export enum SocketState {
  STATIC = 'Static',
  DYNAMIC = 'Dynamic',
  VARIABLE = 'Variable'
}

export interface DatasetMeta {
  schema: Array<ValueSchema>;
}

export interface SocketDef {
  dataType: DataType;
  displayName: string;
  state: SocketState;
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
  displayName: name,
  state: SocketState.STATIC
});

export const NumberSocket = (name: string): SocketDef => ({
  dataType: DataType.NUMBER,
  displayName: name,
  state: SocketState.STATIC
});

export const StringSocket = (name: string): SocketDef => ({
  dataType: DataType.STRING,
  displayName: name,
  state: SocketState.STATIC
});

export const BooleanSocket = (name: string): SocketDef => ({
  dataType: DataType.BOOLEAN,
  displayName: name,
  state: SocketState.STATIC
});

export const DatetimeSocket = (name: string): SocketDef => ({
  dataType: DataType.DATETIME,
  displayName: name,
  state: SocketState.STATIC
});

export const TimeSocket = (name: string): SocketDef => ({
  dataType: DataType.TIME,
  displayName: name,
  state: SocketState.STATIC
});
