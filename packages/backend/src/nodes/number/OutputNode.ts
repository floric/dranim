import { NumberSocket } from '../Sockets';
import { ServerNodeDef } from '../AllNodes';

export const NumberOutputNode: ServerNodeDef = {
  title: 'Number Output',
  inputs: [NumberSocket('Number')],
  outputs: [],
  keywords: [],
  path: ['Numbers'],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: new Map([['Result', values.get('Number')!]])
    })
};
