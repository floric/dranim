import { MongoClient } from 'mongodb';
const promiseRetry = require('promise-retry');

const config = {
  db:
    process.env.NODE_ENV === 'development'
      ? 'mongodb://127.0.0.1:27017'
      : 'mongodb://test:user123@ds163610.mlab.com:63610/masterthesis'
};

export const mongoDbClient = async (): Promise<MongoClient> => {
  return promiseRetry(async (retry, i) => {
    console.log(`Retry ${i} connect to MongoDB`);
    try {
      return await tryConnectToDb();
    } catch (err) {
      retry();
      return null;
    }
  });
};

const tryConnectToDb = async () => {
  const client = await MongoClient.connect(config.db);
  console.log('Connected to MongoDB');
  return client;
};
