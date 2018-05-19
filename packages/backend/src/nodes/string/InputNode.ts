import { ServerNodeDef } from '../AllNodes';
import { StringSocket } from '../Sockets';

export const StringInputNode: ServerNodeDef = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String')],
  keywords: [],
  path: ['String'],
  onServerExecution: async (form, a) => {
    const val = form.get('value');
    return { outputs: new Map([['String', val ? val : '']]) };
  }
};
