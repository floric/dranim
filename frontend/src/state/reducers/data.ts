import { Reducer, AnyAction } from 'redux';
import { getType } from 'typesafe-actions';

import { actions, AddDatasetPayload } from '../actions/data';
import { Dataset } from '../../model/dataset';

export interface IDataState {
  readonly datasets: Map<string, Dataset>;
}

export const reducer: Reducer<IDataState> = (
  state: IDataState = { datasets: new Map() },
  action: AnyAction
) => {
  switch (action.type) {
    case getType(actions.addDataset):
      const typedAction: AddDatasetPayload = action as AddDatasetPayload;
      const datasets = new Map(state.datasets);
      datasets.set(typedAction.payload.datasetId, typedAction.payload.val);
      return {
        datasets
      };
    default:
      return state;
  }
};
