import {
  allAreDefinedAndPresent,
  JoinDatasetsNodeDef,
  JoinDatasetsNodeForm,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { validateNonEmptyString } from '../string/utils';

export const JoinDatasetsNode: ServerNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  JoinDatasetsNodeForm
> = {
  type: JoinDatasetsNodeDef.type,
  isFormValid: form =>
    Promise.resolve(
      validateNonEmptyString(form.valueA) && validateNonEmptyString(form.valueB)
    ),
  onMetaExecution: async (form, inputs) => {
    if (!form.valueA || !form.valueB) {
      return { joined: { isPresent: false, content: { schema: [] } } };
    }
    if (!allAreDefinedAndPresent(inputs)) {
      return {
        joined: { isPresent: false, content: { schema: [] } }
      };
    }

    return {
      joined: {
        content: {
          schema: [
            ...inputs.datasetA.content.schema.map(s => ({
              ...s,
              name: `A_${s.name}`
            })),
            ...inputs.datasetB.content.schema.map(s => ({
              ...s,
              name: `B_${s.name}`
            }))
          ]
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (form, inputs) => {
    return {
      outputs: {
        joined: {
          entries: [],
          schema: [...inputs.datasetA.schema, ...inputs.datasetB.schema]
        }
      }
    };
  }
};
