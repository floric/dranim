import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation } from '../Sockets';
import { DataType, SumNodeDef } from '@masterthesis/shared';

export const SumNode: ClientNodeDef = {
  name: SumNodeDef.name,
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Sum', { dataType: DataType.NUMBER }]
    ])
};
