import { ObjectID } from 'mongodb';

export const getSafeObjectID = (id: string) => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  return new ObjectID(id);
};
