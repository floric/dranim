import { ApolloContext, NodeInstance, NodeState } from '@masterthesis/shared';
import { Db, MongoClient } from 'mongodb';

export const VALID_OBJECT_ID = '5b07b3129ba658500b75a29a';

export const NeverGoHereError = new Error('Should never reach this line!');

export const doTestWithDb = async (op: (db: Db) => Promise<void>) => {
  jest.setTimeout(10000);
  jest.resetAllMocks();

  const server = (global as any).__MONGODB_SERVER_;

  await server.start();
  const uri = await server.getConnectionString();
  const connection = await MongoClient.connect(
    uri,
    {
      useNewUrlParser: true,
      autoReconnect: false
    }
  );
  const db: Db = connection.db();

  try {
    await op(db);
    await server.stop();
  } catch (err) {
    await server.stop();

    throw err;
  }
};

export const NODE: NodeInstance = {
  id: VALID_OBJECT_ID,
  contextIds: [],
  form: {},
  inputs: [],
  outputs: [],
  type: '',
  workspaceId: VALID_OBJECT_ID,
  x: 0,
  y: 9,
  state: NodeState.VALID,
  progress: null,
  variables: {}
};

export interface QueryTestCase {
  id: string;
  query: string;
  expected: object;
  beforeTest: (
    reqContext: ApolloContext
  ) => Promise<{ variables?: object; reqContext?: ApolloContext }>;
}

export interface MutationTestCase {
  id: string;
  mutation: {
    query: string;
    expected: any;
  };
  query: {
    query: string;
    expected: any;
  };
  beforeTest: (
    reqContext: ApolloContext
  ) => Promise<{ variables?: object; reqContext?: ApolloContext }>;
}
