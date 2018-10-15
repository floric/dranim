import { QueryTestCase } from '../../test-utils';

export const anonymUserTest: QueryTestCase = {
  id: 'AnonymUser',
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
  beforeTest: () => Promise.resolve({}),
  expected: {
    user: null
  }
};
