import { Readable } from 'stream';

import { Dataset, DataType, ProcessState, sleep } from '@masterthesis/shared';
import { tryGetDataset } from '../../../src/main/workspace/dataset';
import { createManyEntriesWithDataset } from '../../../src/main/workspace/entry';
import {
  getAllUploads,
  getUpload,
  uploadEntriesCsv
} from '../../../src/main/workspace/upload';
import {
  doTestWithDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

jest.mock('../../../src/main/workspace/dataset');
jest.mock('../../../src/main/workspace/entry');

class Counter extends Readable {
  private max: number = 150;
  private index: number = 1;

  public _read() {
    const i = this.index++;
    if (i > this.max) {
      this.push(null);
    } else if (i > 75) {
      this.push(`invalid\n`);
    } else {
      const buf = Buffer.from(String(i), 'ascii');
      this.push(`"${buf}","true"\n`);
    }
  }
}

describe('Upload', () => {
  test('should get all uploads', () =>
    doTestWithDb(async db => {
      const res = await getAllUploads(VALID_OBJECT_ID, { db, userId: '' });
      expect(res).toEqual([]);
    }));

  test('should get no upload', () =>
    doTestWithDb(async db => {
      let res = await getUpload(VALID_OBJECT_ID, { db, userId: '' });
      expect(res).toBe(null);

      res = await getUpload('test', { db, userId: '' });
      expect(res).toBe(null);
    }));

  test('should throw error when trying to upload with valid and invalid entries', () =>
    doTestWithDb(async db => {
      (tryGetDataset as jest.Mock).mockImplementation(() => {
        throw new Error('Unknown DS');
      });

      try {
        await uploadEntriesCsv(
          [{ filename: 'test.csv', stream: new Counter() }],
          VALID_OBJECT_ID,
          {
            db,
            userId: ''
          }
        );
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Upload failed');
      }
    }));

  test('should do upload with valid and invalid entries', () =>
    doTestWithDb(async db => {
      const ds: Dataset = {
        id: VALID_OBJECT_ID,
        userId: '',
        name: 'DS',
        created: '',
        description: '',
        valueschemas: [
          {
            name: 'value',
            fallback: '0',
            required: true,
            type: DataType.NUMBER,
            unique: false
          },
          {
            name: 'otherValue',
            fallback: '0',
            required: true,
            type: DataType.BOOLEAN,
            unique: false
          }
        ],
        workspaceId: ''
      };
      (tryGetDataset as jest.Mock).mockResolvedValue(ds);
      (createManyEntriesWithDataset as jest.Mock).mockResolvedValue({
        addedEntries: 50,
        errors: { 'invalid-entry': 10, 'other-error': 15 }
      });

      const stream = new Counter();
      const res = await uploadEntriesCsv(
        [{ filename: 'test.csv', stream }],
        VALID_OBJECT_ID,
        {
          db,
          userId: ''
        }
      );

      expect(res).toEqual({
        start: expect.any(Date),
        id: expect.any(String),
        addedEntries: 0,
        datasetId: VALID_OBJECT_ID,
        errors: {},
        failedEntries: 0,
        fileNames: [],
        invalidEntries: 0,
        finish: null,
        state: ProcessState.STARTED
      });

      await sleep(3000);

      const upload = await getUpload(res.id, { db, userId: '' });

      expect(stream.read()).toBe(null);
      expect(upload).toEqual({
        addedEntries: 50,
        datasetId: ds.id,
        errors: {
          'invalid-entry': {
            count: 10,
            message: 'invalid-entry'
          },
          'other-error': {
            count: 15,
            message: 'other-error'
          }
        },
        failedEntries: 25,
        fileNames: ['test.csv'],
        finish: expect.any(Date),
        id: expect.any(String),
        invalidEntries: 75,
        start: expect.any(Date),
        state: ProcessState.SUCCESSFUL
      });

      const uploads = await getAllUploads(VALID_OBJECT_ID, { db, userId: '' });
      expect(uploads).toEqual([
        {
          addedEntries: 50,
          datasetId: VALID_OBJECT_ID,
          errors: {
            'invalid-entry': {
              count: 10,
              message: 'invalid-entry'
            },
            'other-error': {
              count: 15,
              message: 'other-error'
            }
          },
          failedEntries: 25,
          fileNames: ['test.csv'],
          finish: expect.any(Date),
          id: upload.id,
          invalidEntries: 75,
          start: expect.any(Date),
          state: ProcessState.SUCCESSFUL
        }
      ]);

      expect(createManyEntriesWithDataset).toHaveBeenCalledTimes(1);
    }));
});
