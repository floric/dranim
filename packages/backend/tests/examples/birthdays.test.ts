import { createBirthdaysDemoData } from '../../src/examples/birthdays';
import { doTestWithDb } from '../test-utils';

describe('Birthdays Example', () => {
  test('should pass through', () =>
    doTestWithDb(async db => {
      jest.setTimeout(30000);
      const res = await createBirthdaysDemoData({ db, userId: '' });
      expect(res).toBe(true);
    }));
});
