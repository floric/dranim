import { createAction, PayloadAction } from 'typesafe-actions';
import { Dataset } from '../../../../common/src/model/dataset';
import { ValueSchema } from '../../../../common/src/model/valueschema';

const ADD_DATASET = 'ADD_DATASET';
const ADD_DATASET_VALUE_SCHEMA = 'ADD_DATASET_VALUE_SCHEMA';

interface IAddDatasetResponse {
  val: Dataset;
  datasetId: string;
}

export type AddDatasetPayload = PayloadAction<string, IAddDatasetResponse>;

type AddDatasetAction = (val: Dataset, datasetId: string) => AddDatasetPayload;

interface IAddDatasetValueSchemaResponse {
  datasetId: string;
  val: ValueSchema;
}

export type AddDatasetValueSchemaPayload = PayloadAction<
  string,
  IAddDatasetValueSchemaResponse
>;

type AddDatasetValueSchemaAction = (
  datasetId: string,
  val: ValueSchema
) => AddDatasetValueSchemaPayload;

export const actions = {
  addDataset: createAction<string, AddDatasetAction>(
    ADD_DATASET,
    (val, datasetId) => ({
      type: ADD_DATASET,
      payload: {
        val,
        datasetId
      }
    })
  ),
  addDatasetSchemaValue: createAction<string, AddDatasetValueSchemaAction>(
    ADD_DATASET_VALUE_SCHEMA,
    (datasetId, val) => ({
      type: ADD_DATASET_VALUE_SCHEMA,
      payload: {
        val,
        datasetId
      }
    })
  )
};
