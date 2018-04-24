import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as graphqlHTTP from 'express-graphql';
import { graphqlExpress } from 'apollo-server-express';

import { mongoDbClient } from './config/db';
import Schema from './graphql/schema';
import { truncate } from 'fs';
import { GraphQLSchema } from 'graphql';
export const GRAPHQL_ROUTE = '/api/graphql';

interface IMainOptions {
  enableCors: boolean;
  env: string;
  port: number;
  verbose?: boolean;
}

function verbosePrint(port) {
  console.log(
    `GraphQL Server is now running on http://localhost${GRAPHQL_ROUTE}`
  );
}

export const main = async (options: IMainOptions) => {
  const client = await mongoDbClient();

  const app = express();
  app.use(helmet());
  app.use(morgan(options.env));
  app.use(
    GRAPHQL_ROUTE,
    bodyParser.json(),
    graphqlExpress({ schema: Schema, context: { db: client.db('App') } })
  );

  app
    .listen(options.port, () => {
      if (options.verbose) {
        verbosePrint(options.port);
      }

      console.log('Express running.');
    })
    .on('error', (err: Error) => {
      console.error(err);
    });
};

if (require.main === module) {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const NODE_ENV = process.env.NODE_ENV !== 'production' ? 'dev' : 'production';
  const EXPORT_GRAPHIQL = NODE_ENV !== 'production';
  const ENABLE_CORS = NODE_ENV !== 'production';

  main({
    enableCors: ENABLE_CORS,
    env: NODE_ENV,
    port: PORT,
    verbose: true
  });
}
