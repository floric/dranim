import { createUniqueDatasetName } from '../../../src/main/calculation/utils';
import { VALID_OBJECT_ID } from '../../test-utils';

describe('Calculation Utils', () => {
  test('should create generated name', () => {
    const res = createUniqueDatasetName('abc', VALID_OBJECT_ID);
    expect(res).toBeDefined();
  });
});
