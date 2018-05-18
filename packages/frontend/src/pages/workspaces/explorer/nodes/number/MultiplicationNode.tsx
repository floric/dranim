import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, NUMBER_TYPE } from '../Sockets';

export const MultiplicationNode: ClientNodeDef = {
  title: 'Multiplication',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Product', { dataType: NUMBER_TYPE }]
    ])
};
