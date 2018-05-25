import { DataType, SelectValuesNodeDef } from '@masterthesis/shared';
import { Db, MongoClient } from 'mongodb';

import { SelectValuesNode } from '../../../../src/main/nodes/dataset/SelectValuesNode';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import { NeverGoHereError } from '../../../test-utils';

let connection;
let db: Db;

describe('SelectValuesNode', () => {
  beforeAll(async () => {
    connection = await MongoClient.connect((global as any).__MONGO_URI__);
    db = await connection.db((global as any).__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should have correct properties', () => {
    expect(SelectValuesNode.name).toBe(SelectValuesNodeDef.name);
    expect(SelectValuesNode.isFormValid).toBeDefined();
    expect(SelectValuesNode.isInputValid).toBeDefined();
  });

  test('should have valid inputs and invalid inputs', async () => {
    let res = await SelectValuesNode.isInputValid({ dataset: { id: 'test' } });
    expect(res).toBe(true);

    res = await SelectValuesNode.isInputValid({ dataset: { id: null } });
    expect(res).toBe(false);

    res = await SelectValuesNode.isInputValid({ dataset: null });
    expect(res).toBe(false);
  });

  test('should validate form', async () => {
    let res = await SelectValuesNode.isFormValid({ values: [] });
    expect(res).toBe(false);

    res = await SelectValuesNode.isFormValid({ values: null });
    expect(res).toBe(false);

    res = await SelectValuesNode.isFormValid({ values: ['test'] });
    expect(res).toBe(true);
  });

  test('should select values from dataset and create new', async () => {
    const ds = await createDataset(db, 'test');
    await addValueSchema(db, ds.id, {
      name: 'test',
      required: true,
      type: DataType.STRING,
      fallback: '',
      unique: false
    });
    await addValueSchema(db, ds.id, {
      name: 'abc',
      required: false,
      type: DataType.STRING,
      fallback: '',
      unique: false
    });

    const res = await SelectValuesNode.onServerExecution(
      { values: ['test'] },
      { dataset: { id: ds.id } },
      db
    );
    expect(res.outputs.dataset.id).toBeDefined();

    const newDsId = res.outputs.dataset.id;
    const newDs = await getDataset(db, newDsId);

    expect(newDs).not.toBe(null);
    expect(newDs.valueschemas.length).toBe(1);
    expect(newDs.valueschemas[0].name).toBe('test');
  });

  test('should select values from dataset and create new', async () => {
    const ds = await createDataset(db, 'test');
    await addValueSchema(db, ds.id, {
      name: 'test',
      required: true,
      type: DataType.STRING,
      fallback: '',
      unique: false
    });

    try {
      await SelectValuesNode.onServerExecution(
        { values: ['bla', 'test'] },
        { dataset: { id: ds.id } },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown value specified');
    }
  });

  test('should validate dataset', async () => {
    try {
      const res = await SelectValuesNode.onServerExecution(
        { values: ['test'] },
        { dataset: { id: 'ds.id' } },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });
});
