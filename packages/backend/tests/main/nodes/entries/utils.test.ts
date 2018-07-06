import {
  Dataset,
  DataType,
  Entry,
  ValueSchema
} from '../../../../../shared/lib';
import {
  getDynamicEntryContextInputs,
  processEntries
} from '../../../../src/main/nodes/entries/utils';
import {
  getEntriesCount,
  getEntryCollection
} from '../../../../src/main/workspace/entry';
import { setProgress } from '../../../../src/main/workspace/nodes-detail';
import { VALID_OBJECT_ID } from '../../../test-utils';

jest.mock('mongodb');
jest.mock('../../../../src/main/workspace/entry');
jest.mock('../../../../src/main/workspace/nodes-detail');

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
      test: { dataType: DataType.STRING, displayName: 'test', isDynamic: true },
      abc: { dataType: DataType.NUMBER, displayName: 'abc', isDynamic: true }
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
    const progressFn = jest.fn(async () => {
      //
    });
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
    (setProgress as jest.Mock).mockImplementation(progressFn);

    const res = await processEntries(
      VALID_OBJECT_ID,
      VALID_OBJECT_ID,
      processFn,
      { db: null, userId: '' }
    );
    expect(processFn).toHaveBeenCalledTimes(250);
    expect(progressFn).toHaveBeenCalledTimes(3);
    expect(res).toBeUndefined();
  });
});
