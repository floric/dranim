import { ServerNodeDef } from '../AllNodes';
import { StringSocket } from '../Sockets';

export const StringInputNode: ServerNodeDef = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String')],
  keywords: [],
  path: ['String'],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: async (form, a) => {
    const val = form.find(f => f.name === 'value');
    return { outputs: new Map([['String', val ? val.value : '']]) };
  }
};
