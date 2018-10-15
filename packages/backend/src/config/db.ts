import { MongoClient } from 'mongodb';
import { Log } from '../logging';
const promiseRetry = require('promise-retry');

const config = {
  db:
    process.env.NODE_ENV === 'production'
      ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@${
          process.env.DB_MLAB_URL
        }`
      : 'mongodb://127.0.0.1:27017'
};

export const connectToDb = async (): Promise<MongoClient> => {
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
  Log.info(`Trying to connect to ${config.db}`);
  const client = await MongoClient.connect(
    config.db,
    {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_SAFE_INTEGER,
      reconnectInterval: 5000
    }
  );
  console.log(client);
  Log.info('Connected to MongoDB');
  return client;
};
