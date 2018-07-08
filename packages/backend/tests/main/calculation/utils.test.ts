import { createDynamicDatasetName } from '../../../src/main/calculation/utils';
import { VALID_OBJECT_ID } from '../../test-utils';

describe('Calculation Utils', () => {
  test('should create generated name', () => {
    const res = createDynamicDatasetName('abc', VALID_OBJECT_ID);
    expect(res).toBe(`abc-${VALID_OBJECT_ID}`);
  });
});
