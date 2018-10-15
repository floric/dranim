import { ApolloContext } from '@masterthesis/shared';
import { graphql } from 'graphql';
import { addMockFunctionsToSchema } from 'graphql-tools';

import schema, { resolvers } from '../../../src/graphql/schema';
import { doTestWithDb, QueryTestCase } from '../../test-utils';

import { anonymUserTest } from './anonym-user';
import { calculationsTest } from './calculations';
import { datasetTest } from './dataset';
import { datasetsTest } from './datasets';
import { resultsTest } from './results';
import { unknownDatasetTest } from './unknown-dataset';
import { unknownWorkspaceTest } from './unknown-workspace';
import { uploadsTest } from './uploads';
import { userTest } from './user';
import { workspaceTest } from './workspace';
import { workspacesTest } from './workspaces';

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

describe('Query Tests', () => {
  addMockFunctionsToSchema({
    schema,
    preserveResolvers: true
  });

  cases.forEach(obj => {
    const { id, query, expected, beforeTest } = obj;

    test(`should pass test: ${id}`, () =>
      doTestWithDb(async db => {
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
      }));
  });
});
