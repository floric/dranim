import { ApolloContext, InMemoryCache } from '@masterthesis/shared';
import { graphql } from 'graphql';
import { addMockFunctionsToSchema } from 'graphql-tools';

import schema, { resolvers } from '../../../src/graphql/schema';
import { doTestWithDb, MutationTestCase } from '../../test-utils';
import { addEntryTest } from './add-entry';
import { addOrUpdateFormTest } from './add-or-update-form-value';
import { addValueSchemaTest } from './add-vs';
import { createConnTest } from './create-conn';
import { createDsTest } from './create-ds';
import { createNodeTest } from './create-node';
import { createWsTest } from './create-ws';
import { deleteConnTest } from './delete-conn';
import { deleteDsTest } from './delete-ds';
import { deleteEntryTest } from './delete-entry';
import { deleteNodeTest } from './delete-node';
import { deleteWsTest } from './delete-ws';
import { renameDsTest } from './rename-ds';
import { renameWsTest } from './rename-ws';
import { updateNodePosTest } from './update-node-pos';

const cases: Array<MutationTestCase> = [
  createNodeTest,
  deleteNodeTest,
  deleteEntryTest,
  addValueSchemaTest,
  addEntryTest,
  renameDsTest,
  deleteDsTest,
  createDsTest,
  updateNodePosTest,
  createWsTest,
  renameWsTest,
  deleteWsTest,
  addOrUpdateFormTest,
  createConnTest,
  deleteConnTest
];

describe('Mutation Tests', () => {
  addMockFunctionsToSchema({
    schema,
    preserveResolvers: true
  });

  cases.forEach(obj => {
    const { id, query, beforeTest, mutation } = obj;

    test(`should pass test: ${id}`, () =>
      doTestWithDb(async db => {
        const reqContext: ApolloContext = {
          db,
          userId: '123',
          cache: new InMemoryCache()
        };
        const { variables, reqContext: overwrittenContext } = await beforeTest(
          reqContext
        );

        const { data: mutationData, errors: mutationErrors } = await graphql(
          schema,
          mutation.query,
          null,
          { ...reqContext, ...overwrittenContext },
          variables,
          undefined,
          resolvers
        );

        expect(mutationErrors).toBeUndefined();
        expect(mutationData).toMatchObject(mutation.expected);

        const { data: queryData, errors: queryErrors } = await graphql(
          schema,
          query.query,
          null,
          { ...reqContext, ...overwrittenContext },
          variables,
          undefined,
          resolvers
        );

        expect(queryErrors).toBeUndefined();
        expect(queryData).toMatchObject(query.expected);
      }));
  });
});
