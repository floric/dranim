import { register } from '../../../src/main/users/management';
import { QueryTestCase } from '../../test-utils';

export const userTest: QueryTestCase = {
  id: 'User',
  query: `
    query {
      user {
        firstName
        lastName
        mail
        id
      }
    }
  `,
  beforeTest: async reqContext => {
    const newUser = await register(
      'Max',
      'Mustermann',
      'mail@mail.de',
      '123',
      reqContext
    );
    return { reqContext: { db: reqContext.db, userId: newUser.id } };
  },
  expected: {
    user: {
      id: expect.any(String),
      firstName: 'Max',
      lastName: 'Mustermann',
      mail: 'mail@mail.de'
    }
  }
};
