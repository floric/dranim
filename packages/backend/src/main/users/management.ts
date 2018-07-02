import { ApolloContext, User } from '@masterthesis/shared';

import { compare, hash } from 'bcrypt';
import { Collection, Db, ObjectID } from 'mongodb';

const getUsersCollection = (
  db: Db
): Collection<User & { _id: ObjectID; pw: string }> => {
  return db.collection('Users');
};

export const login = async (
  mail: string,
  pw: string,
  reqContext: ApolloContext
): Promise<User | null> => {
  const user = await getFullUserByMail(mail, reqContext);
  if (!user) {
    return null;
  }

  const isPwCorrect = await compare(pw, user.pw);
  if (!isPwCorrect) {
    return null;
  }

  return {
    id: user._id.toHexString(),
    mail: user.mail,
    firstName: user.firstName,
    lastName: user.lastName
  };
};

const getFullUserByMail = async (mail: string, reqContext: ApolloContext) => {
  const coll = getUsersCollection(reqContext.db);
  return await coll.findOne({ mail });
};

const getUser = async (reqContext: ApolloContext): Promise<User | null> => {
  if (!ObjectID.isValid(reqContext.userId)) {
    return null;
  }

  const coll = getUsersCollection(reqContext.db);
  const res = await coll.findOne({ _id: new ObjectID(reqContext.userId) });

  if (!res) {
    return null;
  }

  return {
    id: res._id.toHexString(),
    mail: res.mail,
    firstName: res.firstName,
    lastName: res.lastName
  };
};

export const register = async (
  firstName: string,
  lastName: string,
  mail: string,
  pw: string,
  reqContext: ApolloContext
): Promise<User> => {
  const saltedPw = await hash(pw, 10);
  const coll = getUsersCollection(reqContext.db);
  await coll.createIndex('mail', {
    unique: true
  });
  const res = await coll.insertOne({
    firstName,
    lastName,
    mail,
    pw: saltedPw
  });
  if (res.insertedCount !== 1) {
    throw new Error('Creating user failed');
  }

  const user = res.ops[0];

  return {
    id: user._id.toHexString(),
    mail: user.mail,
    firstName: user.firstName,
    lastName: user.lastName
  };
};

export const tryGetUser = async (reqContext: ApolloContext): Promise<User> => {
  const user = await getUser(reqContext);
  if (!user) {
    throw new Error('Unknown user');
  }

  return user;
};
