import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, STRING_TYPE } from '../Sockets';

export const SubStringNode: ClientNodeDef = {
  title: 'Substring',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['String', { dataType: STRING_TYPE }]
    ])
};
