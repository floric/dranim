import {
  allAreDefinedAndPresent,
  CountEntriesNodeDef,
  CountEntriesNodeInputs,
  CountEntriesNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';
import { count } from 'rxjs/operators';

export const CountEntriesNode: ServerNodeDef<
  CountEntriesNodeInputs,
  CountEntriesNodeOutputs
> = {
  type: CountEntriesNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { count: { content: {}, isPresent: false } };
    }

    return { count: { content: {}, isPresent: true } };
  },
  onNodeExecution: async (form, inputs) => {
    return {
      outputs: {
        count: await inputs.dataset.entries.pipe(count()).toPromise()
      }
    };
  }
};
