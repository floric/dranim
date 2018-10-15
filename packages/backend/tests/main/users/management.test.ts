import {
  checkLoggedInUser,
  getUser,
  login,
  register,
  tryGetUser
} from '../../../src/main/users/management';
import {
  doTestWithDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

describe('Users Management', () => {
  test('should register user, login and logout', () =>
    doTestWithDb(async db => {
      const registerRes = await register(
        'Florian',
        'Richter',
        'flo@flo.de',
        '123',
        { db, userId: '' }
      );
      expect(registerRes.firstName).toBe('Florian');
      expect(registerRes.lastName).toBe('Richter');
      expect(registerRes.mail).toBe('flo@flo.de');
      expect(registerRes.id).toBeDefined();

      const loginRes = await login('flo@flo.de', '123', { db, userId: '' });
      expect(registerRes).toEqual(loginRes);
    }));

  test('should not login with incorrect email', () =>
    doTestWithDb(async db => {
      await register('Florian', 'Richter', 'flo@flo.de', '123', {
        db,
        userId: ''
      });

      const loginRes = await login('abc@flo.de', '123', { db, userId: '' });
      expect(loginRes).toBe(null);
    }));

  test('should not login with incorrect pw', () =>
    doTestWithDb(async db => {
      await register('Florian', 'Richter', 'flo@flo.de', '123', {
        db,
        userId: ''
      });

      const loginRes = await login('flo@flo.de', '456', { db, userId: '' });
      expect(loginRes).toBe(null);
    }));

  test('should not register user with same mail', () =>
    doTestWithDb(async db => {
      let res = await register('Florian', 'Richter', 'flo@flo.de', '123', {
        db,
        userId: ''
      });
      expect(res).toBeDefined();

      res = await register('Florian', 'Richter', 'flo@flo.de', '123', {
        db,
        userId: ''
      });
      expect(res).toBe(null);
    }));

  test('should try to get user', () =>
    doTestWithDb(async db => {
      const { id } = await register('Florian', 'Richter', 'flo@flo.de', '123', {
        db,
        userId: ''
      });

      const user = await tryGetUser({ db, userId: id });
      expect(user.id).toBe(id);
      expect(user.firstName).toBe('Florian');
      expect(user.lastName).toBe('Richter');
      expect(user.mail).toBe('flo@flo.de');
    }));

  test('should get null for missing user', () =>
    doTestWithDb(async db => {
      const user = await getUser({ db, userId: null });
      expect(user).toBe(null);
    }));

  test('should throw error for unknown user', () =>
    doTestWithDb(async db => {
      try {
        await tryGetUser({ db, userId: VALID_OBJECT_ID });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown user');
      }

      try {
        await tryGetUser({ db, userId: '123' });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown user');
      }
    }));

  test('should check user successful', () =>
    doTestWithDb(async db => {
      checkLoggedInUser({ db, userId: VALID_OBJECT_ID });
    }));

  test('should throw error for missing user ID', () =>
    doTestWithDb(async db => {
      try {
        checkLoggedInUser({ db, userId: null });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('User is not authorized');
      }
    }));
});
