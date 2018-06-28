import { MongoClient } from 'mongodb';
const promiseRetry = require('promise-retry');

const config = {
  db:
    process.env.NODE_ENV === 'development'
      ? 'mongodb://127.0.0.1:27017'
      : `mongodb://${process.env.DB_USER}:${
          process.env.DB_PW
        }@ds121251.mlab.com:21251/timeseries_explorer`
};

export const mongoDbClient = async (): Promise<MongoClient> => {
  return promiseRetry(async (retry, i) => {
    try {
      return await tryConnectToDb();
    } catch (err) {
      retry();
      return null;
    }
  });
};

const tryConnectToDb = async () => {
  console.log(`Trying to connect to ${config.db}`);
  const client = await MongoClient.connect(config.db);
  console.log('Connected to MongoDB');
  return client;
};
