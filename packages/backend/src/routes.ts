import { Express } from 'express';
import { Db } from 'mongodb';

import { Log } from './logging';
import { login, register } from './main/users/management';
import { getDataset } from './main/workspace/dataset';
import { getEntryCollection } from './main/workspace/entry';
import { InMemoryCache } from '@masterthesis/shared';

export const generateErrorResponse = (message: string) =>
  JSON.stringify({ error: { message } });

export const registerRoutes = (app: Express, db: Db) => {
  registerHealthEndpoint(app);
  registerLogin(app, db);
  registerLogout(app);
  registerRegistration(app, db);
  registerDatasetDownloads(app, db);
};

const registerHealthEndpoint = (app: Express) => {
  app.get('/still-alive', (req, res) => {
    res.sendStatus(200);
  });
};

const registerRegistration = (app: Express, db: Db) => {
  app.post('/registration', async (req, res) => {
    if (
      !req.body ||
      !req.body.mail ||
      !req.body.pw ||
      !req.body.firstName ||
      !req.body.lastName
    ) {
      res.status(301).send(generateErrorResponse('Invalid request'));
    }
    try {
      const result = await register(
        req.body.firstName,
        req.body.lastName,
        req.body.mail,
        req.body.pw,
        { db, userId: req.session!.userId, cache: new InMemoryCache() }
      );
      if (result) {
        (req.session as any).userId = result.id;
        res.status(200).send(JSON.stringify(result));
      } else {
        res.status(400).send();
      }
    } catch (err) {
      Log.error('Registration error', err);
      res.status(500).send();
    }
  });
};

const registerLogout = (app: Express) => {
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
};

const registerLogin = (app: Express, db: Db) => {
  app.post('/login', async (req, res) => {
    if (!req.body || !req.body.mail || !req.body.pw) {
      res.status(301).send(generateErrorResponse('Invalid request'));
    }

    const mail = req.body.mail;
    const pw = req.body.pw;
    const result = await login(mail, pw, {
      db,
      userId: req.session!.userId,
      cache: new InMemoryCache()
    });
    if (result) {
      (req.session as any).userId = result.id;
      res.status(200).send(JSON.stringify(result));
    } else {
      res
        .status(401)
        .send(generateErrorResponse('Login to access this resource'));
    }
  });
};

const registerDatasetDownloads = (app: Express, db: Db) => {
  app.get('/downloads', async (req, res, next) => {
    if (req.session) {
      const dsId = req.query.dsId;
      const ds = await getDataset(dsId, {
        db,
        userId: req.session.userId,
        cache: new InMemoryCache()
      });
      if (!ds) {
        res.status(404).send();
        return;
      }

      res.setHeader('content-type', 'text/csv');
      res.setHeader(
        'Content-disposition',
        `attachment;filename=${ds.name}.csv`
      );

      const coll = getEntryCollection(dsId, db);
      const cursor = coll.find();
      cursor.on('data', elem => {
        const valuesArr = Object.keys(elem.values)
          .map(n => JSON.stringify(elem.values[n]))
          .join(',');
        res.write(`${valuesArr}\n`);
      });
      cursor.on('end', () => {
        res.end();
      });
    } else {
      res
        .status(401)
        .send(generateErrorResponse('Login to access this resource'));
    }
  });
};
