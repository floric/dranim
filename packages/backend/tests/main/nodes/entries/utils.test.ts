import {
  DataType,
  Entry,
  sleep,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';
import {
  copySchemas,
  getDynamicEntryContextInputs,
  processDocumentsWithCursor,
  processEntries
} from '../../../../src/main/nodes/entries/utils';
import { addValueSchema } from '../../../../src/main/workspace/dataset';
import {
  getEntriesCount,
  getEntryCollection
} from '../../../../src/main/workspace/entry';
import { NeverGoHereError, VALID_OBJECT_ID } from '../../../test-utils';

jest.mock('mongodb');
jest.mock('../../../../src/main/workspace/entry');
jest.mock('../../../../src/main/workspace/nodes-detail');
jest.mock('../../../../src/main/workspace/dataset');

describe.only('Entries Utils', () => {
  test('should return empty inputs for missing dataset', async () => {
    let res = await getDynamicEntryContextInputs(
      {},
      { dataset: null },
      {},
      null
    );
    expect(res).toEqual({});

    res = await getDynamicEntryContextInputs(
      {},
      { dataset: undefined },
      {},
      null
    );
    expect(res).toEqual({});

    res = await getDynamicEntryContextInputs(
      {},
      { dataset: { content: { schema: null }, isPresent: true } },
      {},
      null
    );
    expect(res).toEqual({});
  });

  test('should return empty dataset meta inputs', async () => {
    const res = await getDynamicEntryContextInputs(
      {},
      { dataset: { content: { schema: [] }, isPresent: true } },
      {},
      null
    );
    expect(res).toEqual({});
  });

  test('should return dynamic meta inputs from dataset', async () => {
    const res = await getDynamicEntryContextInputs(
      {},
      {
        dataset: {
          content: {
            schema: [
              {
                name: 'test',
                type: DataType.STRING,
                unique: true,
                required: true,
                fallback: ''
              },
              {
                name: 'abc',
                type: DataType.NUMBER,
                unique: false,
                required: true,
                fallback: ''
              }
            ]
          },
          isPresent: true
        }
      },
      {},
      null
    );
    expect(res).toEqual({
      test: {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.DYNAMIC
      },
      abc: {
        dataType: DataType.NUMBER,
        displayName: 'abc',
        state: SocketState.DYNAMIC
      }
    });
  });

  test('should process entries', async () => {
    const schemaA: ValueSchema = {
      name: 'colA',
      unique: false,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaOnlyA: ValueSchema = {
      name: 'colOnlyA',
      unique: false,
      fallback: '',
      type: DataType.BOOLEAN,
      required: true
    };
    const entryA: Entry = {
      id: 'eA',
      values: { [schemaA.name]: 'test', [schemaOnlyA.name]: true }
    };
    const processFn = jest.fn(async () => {
      //
    });
    (getEntryCollection as jest.Mock).mockReturnValue({
      find: () => {
        let entriesToProces = 250;
        return {
          close: async () => true,
          next: async () => entryA,
          hasNext: async () => {
            if (entriesToProces === 0) {
              return false;
            }

            entriesToProces -= 1;
            return true;
          }
        };
      }
    });
    (getEntriesCount as jest.Mock).mockResolvedValue(250);

    const res = await processEntries(VALID_OBJECT_ID, processFn, {
      db: null,
      userId: ''
    });
    expect(processFn).toHaveBeenCalledTimes(250);
    expect(res).toBeUndefined();
  });

  class Counter {
    constructor(private i: number) {}
    public decrement() {
      this.i = this.i > 0 ? this.i - 1 : 0;
    }
    public value = () => this.i;
  }

  test('should be called five times', async () => {
    const counter = new Counter(100);
    const fn = jest.fn();
    await processDocumentsWithCursor(
      {
        close: () => Promise.resolve(),
        hasNext: () => Promise.resolve(counter.value() > 0),
        next: async () => {
          counter.decrement();
          await sleep(10);
          return 123;
        }
      },
      fn
    );
    expect(fn).toHaveBeenCalledTimes(100);
    expect(fn).toHaveBeenCalledWith(123);
  });

  test('should throw error', async () => {
    const counter = new Counter(5);
    try {
      await processDocumentsWithCursor(
        {
          close: () => Promise.resolve(),
          hasNext: () => Promise.resolve(counter.value() > 0),
          next: () => {
            counter.decrement();
            return Promise.resolve(9);
          }
        },
        () => Promise.reject('test')
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Process in queue has failed');
    }
  });

  test('should copy schemas', async () => {
    (addValueSchema as jest.Mock).mockImplementation(jest.fn(async () => true));
    const res = await copySchemas(
      [
        {
          name: 'test',
          required: true,
          type: DataType.STRING,
          unique: false,
          fallback: 'a'
        },
        {
          name: 'abc',
          required: true,
          type: DataType.STRING,
          unique: false,
          fallback: 'a'
        }
      ],
      VALID_OBJECT_ID,
      { db: null, userId: '' }
    );
    expect(res).toEqual([true, true]);
    expect(addValueSchema).toHaveBeenCalledTimes(2);
  });
});
