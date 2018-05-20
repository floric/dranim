import {
  StringInputNodeDef,
  ServerNodeDef,
  StringInputNodeOutputs
} from '@masterthesis/shared';

export const StringInputNode: ServerNodeDef<{}, StringInputNodeOutputs, {}> = {
  name: StringInputNodeDef.name,
  onServerExecution: async (form, a) => {
    // TODO fix form
    const val = 'test';
    return {
      outputs: {
        string: val
      }
    };
  }
};
