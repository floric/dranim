import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation } from '../Sockets';
import { DataType } from '@masterthesis/shared';

export const MultiplicationNode: ClientNodeDef = {
  title: 'Multiplication',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Product', { dataType: DataType.NUMBER }]
    ])
};
