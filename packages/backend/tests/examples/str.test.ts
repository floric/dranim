import { createSTRDemoData } from '../../src/examples/str';
import { doTestWithDb } from '../test-utils';

describe('STR Example', () => {
  test('should pass through', () =>
    doTestWithDb(async db => {
      const res = await createSTRDemoData({ db, userId: '' });
      expect(res).toBe(true);
    }));
});
