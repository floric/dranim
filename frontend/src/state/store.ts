import { createStore } from 'redux';
import { rootReducer, IRootState } from './reducers/root';

const initialState: IRootState = {
  data: {
    datasets: new Map()
  }
};

function configureStore(state: IRootState = initialState) {
  return createStore(rootReducer, state);
}

// pass an optional param to rehydrate state on app start
const store = configureStore();

// export store singleton instance
export default store;
