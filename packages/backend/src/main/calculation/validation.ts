import {
  IOValues,
  NodeInstance,
  ContextNodeType,
  parseNodeForm,
  DataType
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getDataset } from '../workspace/dataset';
import { tryGetNodeType } from '../nodes/all-nodes';
import { getAllMetaInputs, getInputDefs } from '../workspace/nodes-detail';

export const isNodeInMetaValid = async (node: NodeInstance, db: Db) => {
  let isValidForm = true;
  let isValidInput = true;
  if (
    node.type !== ContextNodeType.INPUT &&
    node.type !== ContextNodeType.OUTPUT
  ) {
    const type = tryGetNodeType(node.type);
    const form = parseNodeForm(node.form);

    isValidForm = type.isFormValid ? await type.isFormValid(form) : true;
  }

  const metaDefs = await getAllMetaInputs(node, db);
  const allInputsPresent = Object.values(metaDefs)
    .map(a => a.isPresent)
    .reduce((a, b) => a && b, true);

  return isValidForm && isValidInput && allInputsPresent;
};

export const areNodeInputsValid = async (
  node: NodeInstance,
  inputs: IOValues<{}>,
  db: Db
) => {
  const inputDefs = await getInputDefs(node, db);
  const res = await Promise.all(
    Object.entries(inputDefs).map(p =>
      isInputValid(inputs[p[0]], p[1].dataType, db)
    )
  );
  return res.reduce((a, b) => a && b, true);
};

export const isInputValid = async (input: any, dataType: DataType, db: Db) => {
  if (input == null) {
    return false;
  }

  if (dataType === DataType.DATASET) {
    return await validateDataset(input, db);
  } else if (dataType === DataType.NUMBER) {
    return validateNumber(input);
  } else if (dataType === DataType.STRING) {
    return validateString(input);
  } else if (dataType === DataType.BOOLEAN) {
    return validateBoolean(input);
  } else if (dataType === DataType.DATETIME) {
    return validateDatatime(input);
  } else if (dataType === DataType.TIME) {
    return validateTime(input);
  }

  console.warn('Unsupported data type: ' + dataType);
  return true;
};

const validateDataset = async (datasetRef: any, db: Db): Promise<boolean> => {
  const ds = await getDataset(db, datasetRef.datasetId);
  if (!ds) {
    return false;
  }

  return true;
};

const validateNumber = (value: any) => {
  return typeof value === 'number' && !Number.isNaN(value);
};

const validateString = (value: any) => {
  return typeof value === 'string';
};

const validateBoolean = (value: any) => {
  return typeof value === 'boolean';
};

const validateDatatime = (value: any) => {
  return value instanceof Date;
};

const validateTime = (value: any) => {
  return value instanceof Date;
};
