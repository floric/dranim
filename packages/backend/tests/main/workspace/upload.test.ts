import { Readable } from 'stream';

import { Dataset, DataType, ProcessState } from '@masterthesis/shared';
import { tryGetDataset } from '../../../src/main/workspace/dataset';
import {
  createEntryWithDataset,
  getEntriesCount
} from '../../../src/main/workspace/entry';
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

  test('should do upload with valid and invalid entries', () =>
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
      (getEntriesCount as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(75);

      const stream = new Counter();
      const res = await uploadEntriesCsv(
        [{ filename: 'test.csv', stream }],
        VALID_OBJECT_ID,
        {
          db,
          userId: ''
        }
      );

      const { id, start, ...rest } = res;
      expect(rest).toEqual({
        addedEntries: 0,
        datasetId: VALID_OBJECT_ID,
        errors: {},
        failedEntries: 0,
        fileNames: [],
        invalidEntries: 0,
        finish: null,
        state: ProcessState.STARTED
      });

      await new Promise((resolve, reject) =>
        setTimeout(async () => {
          const tmp = await getUpload(id, { db, userId: '' });
          if (!tmp) {
            reject('Upload failed');
          }

          const { state } = tmp;
          if (state === ProcessState.SUCCESSFUL) {
            resolve();
          }

          reject();
        }, 1000)
      );

      const upload = await getUpload(id, { db, userId: '' });

      expect(stream.read()).toBe(null);
      expect(upload.addedEntries).toBe(75);
      expect(upload.failedEntries).toBe(0);
      expect(upload.invalidEntries).toBe(150);
      expect(upload.errors).toEqual({});

      const uploads = await getAllUploads(VALID_OBJECT_ID, { db, userId: '' });
      expect(
        uploads.map(n => ({ ...n, finish: new Date(0), start: new Date(0) }))
      ).toEqual([
        {
          addedEntries: 75,
          datasetId: VALID_OBJECT_ID,
          errors: {},
          failedEntries: 0,
          fileNames: ['test.csv'],
          finish: new Date(0),
          id: upload.id,
          invalidEntries: 150,
          start: new Date(0),
          state: ProcessState.SUCCESSFUL
        }
      ]);

      expect(createEntryWithDataset).toHaveBeenCalledTimes(75);
    }));
});
