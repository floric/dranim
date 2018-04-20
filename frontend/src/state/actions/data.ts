import { createAction, PayloadAction } from 'typesafe-actions';
import { Dataset } from '../../model/dataset';

const ADD_DATASET = 'ADD_DATASET';

export type AddDatasetPayload = PayloadAction<
  string,
  { val: Dataset; datasetId: string }
>;
type AddDatasetActionAction = (
  val: Dataset,
  datasetId: string
) => AddDatasetPayload;

export const actions = {
  addDataset: createAction<string, AddDatasetActionAction>(
    ADD_DATASET,
    (val: Dataset, datasetId: string) => ({
      type: ADD_DATASET,
      payload: {
        val,
        datasetId
      }
    })
  )
};
