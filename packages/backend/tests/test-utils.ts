import { NodeInstance, NodeState } from '@masterthesis/shared';
import { Db, MongoClient } from 'mongodb';
import MongodbMemoryServer from 'mongodb-memory-server';

export const VALID_OBJECT_ID = '5b07b3129ba658500b75a29a';
export const MONGO_DB_NAME = 'jest';

export const NeverGoHereError = new Error('Should never reach this line!');

export const getTestMongoDb = async () => {
  jest.setTimeout(10000);

  const mongodbServer = new MongodbMemoryServer({
    instance: {
      dbName: MONGO_DB_NAME
    }
  });

  const uri = await mongodbServer.getConnectionString();

  const connection = await MongoClient.connect(
    uri,
    { useNewUrlParser: true }
  );
  const database: Db = await connection.db(MONGO_DB_NAME);

  return {
    connection,
    database,
    mongodbServer
  };
};

export const NODE: NodeInstance = {
  id: VALID_OBJECT_ID,
  contextIds: [],
  form: [],
  inputs: [],
  outputs: [],
  type: '',
  workspaceId: VALID_OBJECT_ID,
  x: 0,
  y: 9,
  state: NodeState.VALID
};
