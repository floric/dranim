import { MongoClient } from 'mongodb';

const config = {
  db:
    process.env.NODE_ENV === 'development'
      ? 'mongodb://127.0.0.1:27017'
      : 'mongodb://mongodb:27017'
};

export const mongoDbClient = async () => {
  try {
    const client = await MongoClient.connect(config.db);
    console.log('Connected to MongoDB');
    return client;
  } catch (err) {
    console.error(err);
    return null;
  }
};
