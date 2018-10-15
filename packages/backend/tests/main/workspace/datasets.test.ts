import { DataType, ValueSchema } from '@masterthesis/shared';

import {
  addValueSchema,
  clearGeneratedDatasets,
  createDataset,
  deleteDataset,
  getAllDatasets,
  getDataset,
  renameDataset,
  saveTemporaryDataset,
  tryGetDataset
} from '../../../src/main/workspace/dataset';
import {
  clearEntries,
  getEntryCollection
} from '../../../src/main/workspace/entry';
import {
  doTestWithDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

const SCHEMA: ValueSchema = {
  name: 'test',
  fallback: 'abc',
  required: false,
  type: DataType.STRING,
  unique: false
};

jest.mock('../../../src/main/workspace/entry');

describe('Dataset', () => {
  test('should create, get and delete dataset', () =>
    doTestWithDb(async db => {
      const newDs = await createDataset('test', {
        db,
        userId: ''
      });
      expect(newDs.id).toBeDefined();
      expect(newDs.name).toBe('test');
      expect(newDs.valueschemas).toEqual([]);

      const ds = await getDataset(newDs.id, {
        db,
        userId: ''
      });
      expect(ds).toEqual(newDs);

      const res = await deleteDataset(ds.id, {
        db,
        userId: ''
      });
      expect(res).toBe(true);

      const unknownDs = await getDataset(newDs.id, {
        db,
        userId: ''
      });
      expect(unknownDs).toBe(null);
    }));

  test('should return null for invalid ID', () =>
    doTestWithDb(async db => {
      const ds = await getDataset('test', {
        db,
        userId: ''
      });
      expect(ds).toEqual(null);
    }));

  test('should add valueschema', () =>
    doTestWithDb(async db => {
      const newDs = await createDataset('test', {
        db,
        userId: ''
      });
      expect(newDs.id).toBeDefined();
      expect(newDs.name).toBe('test');
      expect(newDs.valueschemas).toEqual([]);

      const res = await addValueSchema(newDs.id, SCHEMA, {
        db,
        userId: ''
      });
      expect(res).toBe(true);

      const ds = await getDataset(newDs.id, {
        db,
        userId: ''
      });
      expect(ds.valueschemas.length).toBe(1);

      const fetchedSchema = ds.valueschemas[0];
      expect(fetchedSchema).toEqual(SCHEMA);
    }));

  test('should add valueschemas for String and create string index', () =>
    doTestWithDb(async db => {
      (getEntryCollection as jest.Mock).mockReturnValue({
        createIndex: jest.fn()
      });

      const newDs = await createDataset('test', {
        db,
        userId: ''
      });
      expect(newDs.id).toBeDefined();
      expect(newDs.name).toBe('test');
      expect(newDs.valueschemas).toEqual([]);

      const res = await addValueSchema(
        newDs.id,
        {
          name: 'test',
          required: true,
          unique: true,
          type: DataType.STRING,
          fallback: ''
        },
        {
          db,
          userId: ''
        }
      );
      expect(res).toBe(true);

      expect(
        getEntryCollection(newDs.id, db).createIndex
      ).toHaveBeenCalledTimes(1);
      expect(getEntryCollection(newDs.id, db).createIndex).toHaveBeenCalledWith(
        `values.test`,
        {
          unique: true,
          background: true
        }
      );
    }));

  test('should throw error for invalid dataset', () =>
    doTestWithDb(async db => {
      try {
        await addValueSchema(VALID_OBJECT_ID, SCHEMA, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown dataset');
      }
    }));

  test('should throw error for empty dataset name', () =>
    doTestWithDb(async db => {
      try {
        await createDataset('', {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Name must not be empty');
      }
    }));

  test('should throw error for empty schema name', () =>
    doTestWithDb(async db => {
      const newDs = await createDataset('test', {
        db,
        userId: ''
      });

      try {
        await addValueSchema(
          newDs.id,
          {
            name: '',
            unique: false,
            type: DataType.STRING,
            required: true,
            fallback: ''
          },
          {
            db,
            userId: ''
          }
        );
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Name must not be empty');
      }
    }));

  test('should throw error for already existing schema', () =>
    doTestWithDb(async db => {
      const newDs = await createDataset('test', {
        db,
        userId: ''
      });
      await addValueSchema(newDs.id, SCHEMA, {
        db,
        userId: ''
      });

      try {
        await addValueSchema(newDs.id, SCHEMA, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Field with this name already exists.');
      }
    }));

  test('should do nothing when trying to delete unknown dataset', () =>
    doTestWithDb(async db => {
      const res = await deleteDataset(VALID_OBJECT_ID, { db, userId: '' });
      expect(res).toBe(false);
    }));

  test('should return all datasets', () =>
    doTestWithDb(async db => {
      const [dsA, dsB, dsC] = await Promise.all([
        createDataset('test', {
          db,
          userId: ''
        }),
        createDataset('test2', {
          db,
          userId: ''
        }),
        createDataset(
          'test3',
          {
            db,
            userId: ''
          },
          VALID_OBJECT_ID
        )
      ]);
      const all = await getAllDatasets({
        db,
        userId: ''
      });

      expect(all).toContainEqual(dsA);
      expect(all).toContainEqual(dsB);
      expect(all).not.toContainEqual(dsC);
      expect(all.length).toBe(2);
    }));

  test('should throw error for unknown dataset', () =>
    doTestWithDb(async db => {
      try {
        await tryGetDataset(VALID_OBJECT_ID, { db, userId: '' });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown dataset');
      }
    }));

  test('should not find dataset from other user', () =>
    doTestWithDb(async db => {
      const ds = await createDataset('test', { db, userId: '123' });
      const otherDs = await getDataset(ds.id, { db, userId: 'abc' });
      expect(otherDs).toBe(null);
    }));

  test('should rename dataset with trimmed name', () =>
    doTestWithDb(async db => {
      const ds = await createDataset('test   ', { db, userId: '' });

      const res = await renameDataset(ds.id, 'new', { db, userId: '' });

      const dsNew = await tryGetDataset(ds.id, { db, userId: '' });
      expect(res).toBe(true);
      expect(ds.name).toBe('test');
      expect(dsNew.name).toBe('new');
    }));

  test('should throw exception when trying to rename dataset with empty name', () =>
    doTestWithDb(async db => {
      const ds = await createDataset('test', { db, userId: '' });

      try {
        await renameDataset(ds.id, '', { db, userId: '' });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Name must not be empty.');
      }
    }));

  test('should throw exception for unknown dataset', () =>
    doTestWithDb(async db => {
      try {
        await renameDataset(VALID_OBJECT_ID, 'test', { db, userId: '' });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown dataset');
      }
    }));

  test('should clear datasets with workspace ID', () =>
    doTestWithDb(async db => {
      const [dsA, dsB, dsC] = await Promise.all([
        createDataset('test', {
          db,
          userId: ''
        }),
        createDataset('test2', {
          db,
          userId: ''
        }),
        createDataset(
          'test3',
          {
            db,
            userId: ''
          },
          VALID_OBJECT_ID
        )
      ]);

      await clearGeneratedDatasets(VALID_OBJECT_ID, { db, userId: '' });
      const [resDsA, resDsB, resDsC] = await Promise.all(
        [dsA, dsB, dsC].map(n => getDataset(n.id, { db, userId: '' }))
      );

      expect(resDsA.id).toBeDefined();
      expect(resDsB.id).toBeDefined();
      expect(resDsC).toBe(null);
      expect(clearEntries).toHaveBeenCalledTimes(1);
    }));

  test('should save temporary dataset', () =>
    doTestWithDb(async db => {
      const [dsA, dsB] = await Promise.all([
        createDataset(
          'test',
          {
            db,
            userId: ''
          },
          VALID_OBJECT_ID
        ),
        createDataset(
          'test2',
          {
            db,
            userId: ''
          },
          VALID_OBJECT_ID
        )
      ]);

      await saveTemporaryDataset(dsA.id, 'New DS', { db, userId: '' });

      const [resDsA, resDsB] = await Promise.all(
        [dsA, dsB].map(n => getDataset(n.id, { db, userId: '' }))
      );

      expect(resDsA.workspaceId).toBe(null);
      expect(resDsB.workspaceId).toBe(VALID_OBJECT_ID);
      expect(resDsA.description).toBe('Generated with Explorer');
    }));

  test('should throw error trying to save temporary dataset', () =>
    doTestWithDb(async db => {
      try {
        await saveTemporaryDataset(VALID_OBJECT_ID, 'New DS', {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Saving temporary dataset failed');
      }
    }));
});
