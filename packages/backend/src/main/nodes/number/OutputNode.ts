import {
  NumberOutputNodeDef,
  ServerNodeDef,
  NumberOutputNodeInputs
} from '@masterthesis/shared';

export const NumberOutputNode: ServerNodeDef<NumberOutputNodeInputs, {}> = {
  name: NumberOutputNodeDef.name,
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        new: values.val
      }
    })
};
