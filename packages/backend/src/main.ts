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
import { login, register } from './main/users/management';
import { initWorkspaceDb } from './main/workspace/workspace';

export const GRAPHQL_ROUTE = '/graphql';

export interface IMainOptions {
  env: string;
  port: number;
  frontendDomain: string;
  verbose?: boolean;
}

function verbosePrint(port) {
  console.log(`Server running on http://localhost${GRAPHQL_ROUTE}`);
}

const MAX_UPLOAD_LIMIT = 100 * 1024 * 1024 * 1024;

const generateErrorResponse = (message: string) =>
  JSON.stringify({ error: { message } });

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
    })
  );

  app.use(helmet());
  app.use(
    session({
      secret: 'work hard',
      resave: true,
      saveUninitialized: true,
      store: new MongoStore({ db }),
      cookie: { secure: options.env === 'production' ? true : false }
    })
  );
  app.use(morgan('tiny'));
  app.use(
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
      context: { db, userId: req!.session!.userId || null }
    }))
  );

  app.post('/logout', async (req, res, next) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return next(err);
        } else {
          return res.status(200).send();
        }
      });
    }
  });
  app.post('/login', async (req, res, next) => {
    if (!req.body || !req.body.mail || !req.body.pw) {
      res.status(301).send(generateErrorResponse('Invalid request'));
    }

    const mail = req.body.mail;
    const pw = req.body.pw;
    const result = await login(mail, pw, db);
    if (result) {
      (req.session as any).userId = result.id;
      res.status(200).send();
    } else {
      res
        .status(401)
        .send(generateErrorResponse('Login to access this resource'));
    }
  });
  app.post('/register', async (req, res) => {
    if (!req.body || !req.body.mail || !req.body.pw || !req.body.name) {
      res.status(301).send(generateErrorResponse('Invalid request'));
    }

    const result = await register(
      req.body.name,
      req.body.mail,
      req.body.pw,
      db
    );
    (req.session as any).userId = result.id;
    res.status(200).send();
  });
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
const FRONTEND_DOMAIN = !!process.env.FRONTEND_DOMAIN
  ? process.env.FRONTEND_DOMAIN
  : 'localhost:1234';

main({
  env: NODE_ENV,
  frontendDomain: FRONTEND_DOMAIN!,
  port: PORT,
  verbose: true
});
