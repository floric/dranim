import { DataType } from '@masterthesis/shared';

export interface OutputSocketInformation {
  dataType: DataType;
  meta?: Array<{ name: string; info: any }>;
  isPresent?: boolean;
}

export const socketColors = new Map([
  [DataType.DATASET, '#0099ff'],
  [DataType.NUMBER, '#ff9900'],
  [DataType.STRING, '#ff0099']
]);
