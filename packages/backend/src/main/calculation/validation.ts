import {
  IOValues,
  DatasetRef,
  NodeInstance,
  ContextNodeType,
  parseNodeForm
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getDataset } from '../workspace/dataset';
import { tryGetNodeType } from '../nodes/all-nodes';
import { getAllMetaInputs } from '../workspace/nodes-detail';

export const isNodeInMetaValid = async (node: NodeInstance, db: Db) => {
  let isValidForm = true;
  let isValidInput = true;
  if (
    node.type !== ContextNodeType.INPUT &&
    node.type !== ContextNodeType.OUTPUT
  ) {
    const type = tryGetNodeType(node);
    const form = parseNodeForm(node.form);

    isValidForm = type.isFormValid ? await type.isFormValid(form) : true;
  }

  const metaDefs = await getAllMetaInputs(node, db);
  const allInputsPresent = Object.values(metaDefs)
    .map(a => a.isPresent)
    .reduce((a, b) => a && b, true);

  return isValidForm && isValidInput && allInputsPresent;
};

export const isNodeInExecutionValid = async (
  node: NodeInstance,
  inputs: IOValues<{}>,
  db: Db
) => {
  const res = await Promise.all(
    Object.values(inputs).map(p => isInputValid(p, db))
  );
  return res.reduce((a, b) => a && b, true);
};

export const isInputValid = async (input: any, db: Db) => {
  if (input == null) {
    return false;
  }

  if (isDatasetRef(input)) {
    return await validateDataset(input, db);
  } else if (typeof input === 'number') {
    return !Number.isNaN(input);
  }

  return true;
};

const isDatasetRef = (input: any): input is DatasetRef => {
  return input.datasetId !== undefined;
};

const validateDataset = async (
  datasetRef: DatasetRef,
  db: Db
): Promise<boolean> => {
  const ds = await getDataset(db, datasetRef.datasetId);
  if (!ds) {
    return false;
  }

  return true;
};
