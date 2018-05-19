import { MongoClient } from 'mongodb';
const promiseRetry = require('promise-retry');

const config = {
  db:
    process.env.NODE_ENV === 'development'
      ? 'mongodb://127.0.0.1:27017'
      : 'mongodb://mongodb:27017'
};

export const mongoDbClient = async (): Promise<MongoClient> => {
  return promiseRetry(async (retry, i) => {
    console.log(`Retry ${i} connect to DB`);
    try {
      return await tryConnectoDb();
    } catch (err) {
      retry();
      return null;
    }
  });
};

export const tryConnectoDb = async () => {
  const client = await MongoClient.connect(config.db);
  console.log('Connected to MongoDB');
  return client;
};
