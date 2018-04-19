import { Reducer, AnyAction } from 'redux';
import { getType } from 'typesafe-actions';

import { actions, AddEntryPayload } from '../actions/data';
import { Entry } from '../../model/entry';

export interface IDataState {
  readonly entries: ReadonlyArray<Entry>;
}

export const reducer: Reducer<IDataState> = (
  state: IDataState = { entries: [] },
  action: AnyAction
) => {
  switch (action.type) {
    case getType(actions.add):
      const typedAction: AddEntryPayload = action as AddEntryPayload;
      const entries = state.entries.slice();
      entries.push(typedAction.payload);
      return {
        entries
      };
    default:
      return state;
  }
};
