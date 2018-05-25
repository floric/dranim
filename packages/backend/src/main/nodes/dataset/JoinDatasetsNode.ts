import {
  JoinDatasetsNodeDef,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const JoinDatasetsNode: ServerNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs
> = {
  name: JoinDatasetsNodeDef.name,
  isInputValid: async inputs => {
    const aVal = inputs.datasetA;
    const bVal = inputs.datasetB;

    if (!aVal || !bVal) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, inputs) => {
    return { outputs: { joined: '{}' } };
  }
};
