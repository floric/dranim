const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');

import { graphqlExpress } from 'apollo-server-express';
import { apolloUploadExpress } from 'apollo-upload-server';
import { truncate } from 'fs';
import { GraphQLSchema } from 'graphql';

import { mongoDbClient } from './config/db';
import Schema from './graphql/schema';
export const GRAPHQL_ROUTE = '/api/graphql';

interface IMainOptions {
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
  const app = express();
  if (options.env !== 'production') {
    app.use(cors());
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
    graphqlExpress({ schema: Schema, context: { db: client.db('App') } })
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

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV !== 'production' ? 'dev' : 'production';
const EXPORT_GRAPHIQL = NODE_ENV !== 'production';

main({
  env: NODE_ENV,
  port: PORT,
  verbose: true
});
