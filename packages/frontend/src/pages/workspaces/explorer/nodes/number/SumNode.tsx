import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation } from '../Sockets';
import { DataType } from '@masterthesis/shared';

export const SumNode: ClientNodeDef = {
  title: 'Sum',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Sum', { dataType: DataType.NUMBER }]
    ])
};
