import { combineReducers } from 'redux';

import { reducer as dataReducer, IDataState } from './data';

export interface IRootState {
  readonly data: IDataState;
}

export const rootReducer = combineReducers<IRootState>({
  data: dataReducer
});
