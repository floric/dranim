import {
  BooleanOutputNodeDef,
  BooleanOutputNodeInputs,
  BooleanOutputNodeResults,
  ServerNodeDef
} from '@masterthesis/shared';

export const BooleanOutputNode: ServerNodeDef<
  BooleanOutputNodeInputs,
  {},
  {},
  BooleanOutputNodeResults
> = {
  type: BooleanOutputNodeDef.type,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.value
      }
    })
};
