import { NumberOutputNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const NumberOutputNode: ServerNodeDef = {
  name: NumberOutputNodeDef.name,
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: new Map([['Result', values.get('Number')!]])
    })
};
