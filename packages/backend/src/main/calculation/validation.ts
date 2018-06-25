import {
  ContextNodeType,
  DataType,
  IOValues,
  NodeInstance,
  parseNodeForm
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getMetaInputs } from '../calculation/meta-execution';
import { tryGetNodeType } from '../nodes/all-nodes';
import { getDataset } from '../workspace/dataset';
import { getInputDefs } from '../workspace/nodes-detail';

export const isNodeInMetaValid = async (node: NodeInstance, db: Db) => {
  let isValidForm = true;
  const isValidInput = true;
  if (
    node.type !== ContextNodeType.INPUT &&
    node.type !== ContextNodeType.OUTPUT
  ) {
    const type = tryGetNodeType(node.type);
    const form = parseNodeForm(node.form);

    isValidForm = type.isFormValid ? await type.isFormValid(form) : true;
  }

  const metaDefs = await getMetaInputs(node, db);
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

const validateDataset = async (datasetRef: any, db: Db): Promise<boolean> => {
  const ds = await getDataset(db, datasetRef.datasetId);
  if (!ds) {
    return false;
  }

  return true;
};

const validateNumber = (value: any) => {
  return Promise.resolve(typeof value === 'number' && !Number.isNaN(value));
};

const validateString = (value: any) => {
  return Promise.resolve(typeof value === 'string');
};

const validateBoolean = (value: any) => {
  return Promise.resolve(typeof value === 'boolean');
};

const validateDatatime = (value: any) => {
  return Promise.resolve(value instanceof Date);
};

const validateTime = (value: any) => {
  return Promise.resolve(value instanceof Date);
};

const validationMethods: Map<
  string,
  (input: any, db: Db) => Promise<boolean>
> = new Map([
  [DataType.DATASET, validateDataset],
  [DataType.STRING, validateString],
  [DataType.NUMBER, validateNumber],
  [DataType.BOOLEAN, validateBoolean],
  [DataType.TIME, validateTime],
  [DataType.DATETIME, validateDatatime]
]);

export const isInputValid = async (input: any, dataType: DataType, db: Db) => {
  if (input == null) {
    return false;
  }

  if (!validationMethods.has(dataType)) {
    console.warn('Unsupported data type: ' + dataType);
    return true;
  }

  return await validationMethods.get(dataType)!(input, db);
};
