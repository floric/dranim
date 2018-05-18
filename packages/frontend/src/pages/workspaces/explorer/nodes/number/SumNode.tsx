import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, NUMBER_TYPE } from '../Sockets';

export const SumNode: ClientNodeDef = {
  title: 'Sum',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Sum', { dataType: NUMBER_TYPE }]
    ])
};
