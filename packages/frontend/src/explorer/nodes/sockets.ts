import { Colors, DataType } from '@masterthesis/shared';

export const socketColors = new Map([
  [DataType.DATASET, Colors.Dataset],
  [DataType.NUMBER, Colors.Number],
  [DataType.DATETIME, Colors.Datetime],
  [DataType.TIME, Colors.Time],
  [DataType.STRING, Colors.String],
  [DataType.BOOLEAN, Colors.Boolean]
]);
