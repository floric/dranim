import { Dataset, DatasetInputNodeDef, DataType } from '@masterthesis/shared';

import { DatasetInputNode } from '../../../../src/main/nodes/dataset/input';
import { processEntries } from '../../../../src/main/nodes/entries/utils';
import {
  getDataset,
  tryGetDataset
} from '../../../../src/main/workspace/dataset';
import { doTestWithDb, NODE, VALID_OBJECT_ID } from '../../../test-utils';

jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/nodes/entries/utils');

const ds: Dataset = {
  id: VALID_OBJECT_ID,
  userId: '',
  name: 'test',
  valueschemas: [
    {
      name: 'test',
      type: DataType.STRING,
      fallback: '',
      required: true,
      unique: false
    }
  ],
  workspaceId: VALID_OBJECT_ID,
  created: new Date().toISOString(),
  description: ''
};

describe('DatasetInputNode', () => {
  test('should have correct properties', () => {
    expect(DatasetInputNode.type).toBe(DatasetInputNodeDef.type);
    expect(DatasetInputNode.isFormValid).toBeDefined();
    expect(DatasetInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form with valid dataset', () =>
    doTestWithDb(async db => {
      (tryGetDataset as jest.Mock).mockResolvedValue(ds);
      (processEntries as jest.Mock).mockImplementation(async (a, processFn) =>
        processFn({ values: { test: 'abc' }, id: 'test' })
      );
      const res = await DatasetInputNode.onNodeExecution(
        { dataset: VALID_OBJECT_ID },
        {},
        {
          reqContext: { db, userId: '' },
          node: NODE
        }
      );
      expect(res.outputs.dataset).toEqual({
        entries: [{ test: 'abc' }],
        schema: [
          {
            name: 'test',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          }
        ]
      });
    }));

  test('should accept form', async () => {
    const res = await DatasetInputNode.isFormValid({ dataset: 'test' });

    expect(res).toBe(true);
  });

  test('should not accept form', async () => {
    const res = await DatasetInputNode.isFormValid({ dataset: null });

    expect(res).toBe(false);
  });

  test('should have absent meta for missing dataset', async () => {
    let res = await DatasetInputNode.onMetaExecution(
      { dataset: null },
      {},
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: undefined },
      {},
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: '' },
      {},
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: VALID_OBJECT_ID },
      {},
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should have valid meta for dataset', async () => {
    (getDataset as jest.Mock).mockResolvedValue(ds);

    const res = await DatasetInputNode.onMetaExecution(
      { dataset: VALID_OBJECT_ID },
      {},
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: {
        isPresent: true,
        content: {
          schema: [
            {
              fallback: '',
              name: 'test',
              required: true,
              type: 'String',
              unique: false
            }
          ]
        }
      }
    });
  });
});
