import { StringOutputNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const StringOutputNode: ServerNodeDef = {
  name: StringOutputNodeDef.name,
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: new Map([['Result', values.get('String')!]])
    })
};
