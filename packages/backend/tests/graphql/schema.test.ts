import { ApolloContext } from '@masterthesis/shared';
import { graphql } from 'graphql';
import { addMockFunctionsToSchema, mockServer } from 'graphql-tools';

import schema, { resolvers, typeDefs } from '../../src/graphql/schema';
import { getTestMongoDb, QueryTestCase } from '../test-utils';

import { anonymUserTest } from './queries/anonym-user';
import { calculationsTest } from './queries/calculations';
import { datasetTest } from './queries/dataset';
import { datasetsTest } from './queries/datasets';
import { resultsTest } from './queries/results';
import { unknownDatasetTest } from './queries/unknown-dataset';
import { unknownWorkspaceTest } from './queries/unknown-workspace';
import { uploadsTest } from './queries/uploads';
import { userTest } from './queries/user';
import { workspaceTest } from './queries/workspace';
import { workspacesTest } from './queries/workspaces';

let conn;
let db;
let server;

const cases: Array<QueryTestCase> = [
  calculationsTest,
  datasetTest,
  unknownDatasetTest,
  datasetsTest,
  workspacesTest,
  workspaceTest,
  unknownWorkspaceTest,
  uploadsTest,
  anonymUserTest,
  userTest,
  resultsTest
];

describe('GraphQL Tests', () => {
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
    const { id, query, expected, beforeTest } = obj;

    test(`should pass test: ${id}`, async () => {
      const reqContext: ApolloContext = { db, userId: '123' };
      const { variables, reqContext: overwrittenContext } = await beforeTest(
        reqContext
      );

      const { data, errors } = await graphql(
        schema,
        query,
        null,
        { ...reqContext, ...overwrittenContext },
        variables,
        undefined,
        resolvers
      );

      expect(errors).toBeUndefined();
      expect(data).toMatchObject(expected);
    });
  });
});
