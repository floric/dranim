import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation } from '../Sockets';
import { DataType, MultiplicationNodeDef } from '@masterthesis/shared';

export const MultiplicationNode: ClientNodeDef = {
  name: MultiplicationNodeDef.name,
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Product', { dataType: DataType.NUMBER }]
    ])
};
