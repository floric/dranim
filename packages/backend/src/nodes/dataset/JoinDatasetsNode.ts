import { DataSocket } from '../Sockets';
import { ServerNodeDef } from '../AllNodes';

export const JoinDatasetsNode: ServerNodeDef = {
  title: 'Dataset Output',
  inputs: [DataSocket('A'), DataSocket('B')],
  outputs: [DataSocket('Combined')],
  path: ['Dataset'],
  keywords: [],
  isInputValid: async inputs => {
    const aVal = inputs.get('A');
    const bVal = inputs.get('B');

    if (!aVal || !bVal) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, inputs) => {
    return { outputs: new Map() };
  }
};
