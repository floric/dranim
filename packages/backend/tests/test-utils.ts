import { Db, MongoClient } from 'mongodb';
import MongodbMemoryServer from 'mongodb-memory-server';
import sleepPromise from 'sleep-promise';

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

  const connection = await MongoClient.connect(uri);
  const database: Db = await connection.db(MONGO_DB_NAME);

  return {
    connection,
    database,
    mongodbServer
  };
};

export const sleep = (ms: number): Promise<void> => sleepPromise(ms);
