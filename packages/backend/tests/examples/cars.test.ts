import { createCarsDemoData } from '../../src/examples/cars';
import { doTestWithDb } from '../test-utils';

describe('Card Example', () => {
  test('should pass through', () =>
    doTestWithDb(async db => {
      const res = await createCarsDemoData({ db, userId: '' });
      expect(res).toBe(true);
    }));
});
