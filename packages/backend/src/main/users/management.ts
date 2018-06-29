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
  const user = await getUser(mail, db);
  if (!user) {
    return null;
  }

  const isPwCorrect = await compare(pw, user.pw);
  if (!isPwCorrect) {
    return null;
  }

  return user;
};

export const logout = async (db: Db): Promise<boolean> => {
  return true;
};

const getUser = async (mail: string, db: Db) => {
  const coll = getUsersCollection(db);
  return await coll.findOne({ mail });
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

  return res.ops[0];
};
