import { User } from '@masterthesis/shared';
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
  db: Db
): Promise<User | null> => {
  const user = await getFullUserByMail(mail, db);
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
    name: user.name
  };
};

export const logout = async (db: Db): Promise<boolean> => {
  return true;
};

const getFullUserByMail = async (mail: string, db: Db) => {
  const coll = getUsersCollection(db);
  return await coll.findOne({ mail });
};

const getUser = async (id: string, db: Db): Promise<User | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const coll = getUsersCollection(db);
  const res = await coll.findOne({ _id: new ObjectID(id) });

  if (!res) {
    return null;
  }

  return { id: res._id.toHexString(), mail: res.mail, name: res.name };
};

export const register = async (
  name: string,
  mail: string,
  pw: string,
  db: Db
): Promise<User> => {
  const saltedPw = await hash(pw, 10);
  const res = await getUsersCollection(db).insertOne({
    name,
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
    name: user.name
  };
};

export const tryGetUser = async (userId: string, db: Db): Promise<User> => {
  const user = await getUser(userId, db);
  if (!user) {
    throw new Error('Unknown user');
  }

  return user;
};
