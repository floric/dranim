import { createAction, PayloadAction } from 'typesafe-actions';
import { Entry } from '../../model/entry';

const ADD_ENTRY = 'ADD_ENTRY';

export type AddEntryPayload = PayloadAction<string, Entry>;
type AddEntryActionAction = (val: Entry) => AddEntryPayload;

export const actions = {
  add: createAction<string, AddEntryActionAction>(ADD_ENTRY, (val: Entry) => ({
    type: ADD_ENTRY,
    payload: val
  }))
};
