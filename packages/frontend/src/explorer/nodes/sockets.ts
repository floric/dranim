import { Colors, DataType } from '@masterthesis/shared';

export const socketColors = new Map([
  [DataType.DATASET, Colors.Dataset],
  [DataType.NUMBER, Colors.Number],
  [DataType.DATE, Colors.Date],
  [DataType.STRING, Colors.String],
  [DataType.BOOLEAN, Colors.Boolean]
]);
