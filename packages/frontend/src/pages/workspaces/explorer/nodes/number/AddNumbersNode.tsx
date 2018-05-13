import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, NUMBER_TYPE } from '../Sockets';

export const AddNumbersNode: ClientNodeDef = {
  title: 'Add Numbers',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Sum', { dataType: NUMBER_TYPE }]
    ])
};
