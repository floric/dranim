import { graphql } from 'graphql';
import { addMockFunctionsToSchema, mockServer } from 'graphql-tools';

import { ApolloContext } from '@masterthesis/shared';
import schema, { resolvers, typeDefs } from '../../src/graphql/schema';
import { getTestMongoDb, TestCase } from '../test-utils';

import { datasetTest } from './cases/dataset';
import { datasetsTest } from './cases/datasets';
import { workspacesTest } from './cases/workspaces';

let conn;
let db;
let server;

const cases: Array<TestCase> = [datasetTest, datasetsTest, workspacesTest];

describe('Dataset Resolver', () => {
  beforeAll(async () => {
    const { connection, database, mongodbServer } = await getTestMongoDb();
    conn = connection;
    db = database;
    server = mongodbServer;
  });

  afterAll(async () => {
    await conn.close();
    await server.stop();
    db = undefined;
    conn = undefined;
    server = undefined;
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  addMockFunctionsToSchema({
    schema,
    preserveResolvers: true
  });

  test('has valid type definitions', async () => {
    expect(async () => {
      const MockServer = mockServer(typeDefs, {});

      await MockServer.query(`{ __schema { types { name } } }`);
    }).not.toThrow();
  });

  cases.forEach(obj => {
    const { id, query, expected, beforeTestAndGetVars, afterTest } = obj;

    test(`should pass test: ${id}`, async () => {
      const reqContext: ApolloContext = { db, userId: '123' };
      const variables = await beforeTestAndGetVars(reqContext);

      const { data, errors } = await graphql(
        schema,
        query,
        null,
        reqContext,
        variables,
        undefined,
        resolvers
      );

      expect(errors).toBeUndefined();
      expect(data).toMatchObject(expected);

      if (afterTest) {
        await afterTest(reqContext);
      }
    });
  });
});
