import { Db, MongoClient } from 'mongodb';

const MongodbMemoryServer = require('mongodb-memory-server');

export const VALID_OBJECT_ID = '5b07b3129ba658500b75a29a';
export const MONGO_DB_NAME = 'jest';

export const NeverGoHereError = new Error('Should never reach this line!');

export const getTestMongoDb = async () => {
  const mongodbServer = new MongodbMemoryServer.default({
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
