import { StringInputNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const StringInputNode: ServerNodeDef = {
  name: StringInputNodeDef.name,
  onServerExecution: async (form, a) => {
    const val = form.get('value');
    return { outputs: new Map([['String', val ? val : '']]) };
  }
};
