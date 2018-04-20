import { Reducer, AnyAction } from 'redux';
import { getType } from 'typesafe-actions';

import {
  actions,
  AddDatasetPayload,
  AddDatasetValueSchemaPayload
} from '../actions/data';
import { Dataset } from '../../model/dataset';

export interface IDataState {
  readonly datasets: Map<string, Dataset>;
}

export const reducer: Reducer<IDataState> = (
  state: IDataState = { datasets: new Map() },
  action: AnyAction
) => {
  let typedAction = action;

  switch (action.type) {
    case getType(actions.addDataset):
      typedAction = action as AddDatasetPayload;
      const datasets = new Map(state.datasets);
      datasets.set(typedAction.payload.datasetId, typedAction.payload.val);
      return {
        datasets
      };

    case getType(actions.addDatasetSchemaValue):
      (typedAction as AddDatasetValueSchemaPayload) = action as AddDatasetValueSchemaPayload;
      const dataset = state.datasets.get(typedAction.payload.datasetId);
      if (!dataset) {
        throw new Error('Invalid dataset ID provided');
      }

      // TODO Improve typing of actions!

      dataset.schema.addValue(typedAction.payload.val);
      return {
        datasets: new Map(state.datasets)
      };

    default:
      return state;
  }
};
