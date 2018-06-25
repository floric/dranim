import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';

import { graphqlExpress } from 'apollo-server-express';
import { apolloUploadExpress } from 'apollo-upload-server';
import { Db } from 'mongodb';

import { mongoDbClient } from './config/db';
import Schema from './graphql/schema';
import { initWorkspaceDb } from './main/workspace/workspace';

export const GRAPHQL_ROUTE = '/api/graphql';

export interface IMainOptions {
  env: string;
  port: number;
  verbose?: boolean;
}

function verbosePrint(port) {
  console.log(`Server running on http://localhost${GRAPHQL_ROUTE}`);
}

const MAX_UPLOAD_LIMIT = 100 * 1024 * 1024 * 1024;

export const main = async (options: IMainOptions) => {
  const client = await mongoDbClient();
  const db = client.db('App');
  await initDb(db);

  const app = express();
  if (options.env !== 'production') {
    app.use(
      cors({
        maxAge: 600,
        origin: 'http://localhost:1234'
      })
    );
  }

  app.use(helmet());
  app.use(morgan(options.env));
  app.use(
    GRAPHQL_ROUTE,
    bodyParser.json({
      limit: MAX_UPLOAD_LIMIT
    }),
    bodyParser.urlencoded({
      limit: MAX_UPLOAD_LIMIT,
      extended: true
    }),
    apolloUploadExpress({
      maxFieldSize: MAX_UPLOAD_LIMIT,
      maxFiles: 10,
      maxFileSize: MAX_UPLOAD_LIMIT
    }),
    graphqlExpress({
      schema: Schema,
      context: { db }
    })
  );

  app
    .listen(options.port, () => {
      if (options.verbose) {
        verbosePrint(options.port);
      }
    })
    .on('error', (err: Error) => {
      console.error(err);
    });
};

export const initDb = async (db: Db) => {
  await initWorkspaceDb(db);
};

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV !== 'production' ? 'dev' : 'production';

main({
  env: NODE_ENV,
  port: PORT,
  verbose: true
});
