import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

import { ApolloServer } from 'apollo-server-express';
import { Db } from 'mongodb';
import Raven from 'raven';

import { connectToDb } from './config/db';
import Schema from './graphql/schema';
import { Log, MorganLogStream } from './logging';
import { getConnectionsCollection } from './main/workspace/connections';
import { getDatasetsCollection } from './main/workspace/dataset';
import { getNodesCollection } from './main/workspace/nodes';
import { getWorkspacesCollection } from './main/workspace/workspace';
import { registerRoutes } from './routes';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const GRAPHQL_ROUTE = '/graphql';

export interface MainOptions {
  port: number;
  frontendDomain: string;
}

const MAX_UPLOAD_LIMIT = 100 * 1024 * 1024 * 1024;
const PORT = parseInt(process.env.PORT || '80', 10);
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || 'localhost:1234';
const CORS = (options: MainOptions) => ({
  maxAge: 600,
  credentials: true,
  origin:
    process.env.NODE_ENV === 'production'
      ? `https://${options.frontendDomain}`
      : 'http://localhost:1234'
});

const initDatabase = (db: Db) =>
  Promise.all([
    getConnectionsCollection(db).createIndex('workspaceId'),
    getNodesCollection(db).createIndex('workspaceId'),
    getWorkspacesCollection(db).createIndex('userId'),
    getDatasetsCollection(db).createIndex('userId')
  ]);

const initServer = (options: MainOptions, db: Db) => {
  const app = express();
  app.use(
    cors(CORS(options)),
    helmet(),
    session({
      secret: process.env.SESSION_SECRET,
      sameSite: false,
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({ db, touchAfter: 60 }),
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

  const server = new ApolloServer({
    schema: Schema,
    context: context => ({ db, userId: context.req.session.userId || null }),
    engine:
      process.env.NODE_ENV === 'production'
        ? {
            apiKey: process.env.APOLLO_ENGINE_KEY
          }
        : undefined,
    uploads: {
      maxFieldSize: MAX_UPLOAD_LIMIT,
      maxFiles: 10,
      maxFileSize: MAX_UPLOAD_LIMIT
    }
  });
  server.applyMiddleware({
    app,
    cors: CORS(options)
  });

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

const initSentry = () =>
  Raven.config('https://16afe3c47bed41f28bee907b0c100c93@sentry.io/1279808', {
    autoBreadcrumbs: true
  }).install();

export const main = async (options: MainOptions) => {
  const client = await connectToDb();
  const db = client.db(process.env.DB_NAME || 'dranim');
  await initDatabase(db);
  initServer(options, db);
  initSentry();
};

main({
  frontendDomain: FRONTEND_DOMAIN!,
  port: PORT
});
