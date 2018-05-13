import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, NUMBER_TYPE } from '../Sockets';

export const StringLengthNode: ClientNodeDef = {
  title: 'String Length',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Length', { dataType: NUMBER_TYPE }]
    ])
};
