import { DistinctEntriesNodeDef } from '@masterthesis/shared';

import { DistinctEntriesNode } from '../../../../src/main/nodes/entries/distinct-entries';
import { NeverGoHereError, NODE, VALID_OBJECT_ID } from '../../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/calculation/utils');
jest.mock('../../../../src/main/workspace/entry');

describe('DistinctEntriesNode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should have correct properties', () => {
    expect(DistinctEntriesNode.type).toBe(DistinctEntriesNodeDef.type);
    expect(DistinctEntriesNode.isFormValid).toBeUndefined();
    expect(DistinctEntriesNode.isInputValid).toBeUndefined();
    expect(
      DistinctEntriesNode.transformContextInputDefsToContextOutputDefs
    ).toBeDefined();
    expect(
      DistinctEntriesNode.transformInputDefsToContextInputDefs
    ).toBeDefined();
  });

  test('should throw error for invalid dataset', async () => {
    try {
      await DistinctEntriesNode.onNodeExecution(
        { schema: null, newSchemas: [] },
        { dataset: { datasetId: VALID_OBJECT_ID } },
        {
          reqContext: { db: null, userId: '' },
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset source');
    }
  });
});
