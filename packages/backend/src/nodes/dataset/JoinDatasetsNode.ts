import { JoinDatasetsNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const JoinDatasetsNode: ServerNodeDef = {
  name: JoinDatasetsNodeDef.name,
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
