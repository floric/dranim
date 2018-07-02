import { Express } from 'express';
import { Db } from 'mongodb';

import { login, register } from './main/users/management';

export const generateErrorResponse = (message: string) =>
  JSON.stringify({ error: { message } });

export const registerRoutes = (app: Express, db: Db) => {
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
    const result = await login(mail, pw, { db, userId: req.session!.userId });
    if (result) {
      (req.session as any).userId = result.id;
      res.status(200).send(JSON.stringify(result));
    } else {
      res
        .status(401)
        .send(generateErrorResponse('Login to access this resource'));
    }
  });

  app.get('/still-alive', (req, res) => {
    res.sendStatus(200);
  });

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
        { db, userId: req.session!.userId }
      );
      (req.session as any).userId = result.id;
      res.status(200).send(JSON.stringify(result));
    } catch (err) {
      res.status(500).send();
    }
  });
};
