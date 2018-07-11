import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

import { graphqlExpress } from 'apollo-server-express';
import { apolloUploadExpress } from 'apollo-upload-server';
import { Db } from 'mongodb';

import { mongoDbClient } from './config/db';
import Schema from './graphql/schema';
import { Log, MorganLogStream } from './logging';
import { initWorkspaceDb } from './main/workspace/workspace';
import { generateErrorResponse, registerRoutes } from './routes';

export const GRAPHQL_ROUTE = '/graphql';

export interface IMainOptions {
  env: string;
  port: number;
  frontendDomain: string;
}

const MAX_UPLOAD_LIMIT = 100 * 1024 * 1024 * 1024;

export const main = async (options: IMainOptions) => {
  const client = await mongoDbClient();
  const db = client.db('timeseries_explorer');
  await initDb(db);

  const app = express();
  app.use(
    cors({
      maxAge: 600,
      credentials: true,
      origin:
        options.env === 'production'
          ? `https://${options.frontendDomain}`
          : 'http://localhost:1234'
    }),
    helmet(),
    session({
      secret: process.env.SESSION_SECRET,
      sameSite: false,
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({ db }),
      cookie: { secure: false }
    }),
    morgan('short', {
      skip: req => req.headers['user-agent'] === 'ELB-HealthChecker/1.0',
      stream: new MorganLogStream()
    }),
    bodyParser.json({}),
    bodyParser.urlencoded({
      extended: true
    })
  );

  app.use(
    GRAPHQL_ROUTE,
    (req, res, next) => {
      if (req.session && req.session.userId) {
        next();
      } else {
        res
          .status(401)
          .send(generateErrorResponse('Login to access this resource'));
      }
    },
    apolloUploadExpress({
      maxFieldSize: MAX_UPLOAD_LIMIT,
      maxFiles: 10,
      maxFileSize: MAX_UPLOAD_LIMIT
    }),
    graphqlExpress(req => ({
      schema: Schema,
      context: { db, userId: req!.session!.userId }
    }))
  );

  registerRoutes(app, db);

  app
    .listen(options.port, () => {
      Log.info(
        `Server running on http://localhost${GRAPHQL_ROUTE}:${options.port}`
      );
    })
    .on('error', (err: Error) => {
      Log.error('App error', err);
    });
};

export const initDb = async (db: Db) => {
  await initWorkspaceDb(db);
};

const PORT = parseInt(process.env.PORT || '80', 10);
const NODE_ENV = process.env.NODE_ENV !== 'production' ? 'dev' : 'production';
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || 'localhost:1234';

main({
  env: NODE_ENV,
  frontendDomain: FRONTEND_DOMAIN!,
  port: PORT
});
