import { addMockFunctionsToSchema, mockServer } from 'graphql-tools';

import schema, { typeDefs } from '../../src/graphql/schema';
describe('Schema', () => {
  addMockFunctionsToSchema({
    schema,
    preserveResolvers: true
  });

  test('should have valid type definitions', async () => {
    expect(async () => {
      const MockServer = mockServer(typeDefs, {});

      await MockServer.query(`{ __schema { types { name } } }`);
    }).not.toThrow();
  });
});
