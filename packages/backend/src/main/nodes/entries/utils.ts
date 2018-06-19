import {
  DatasetMeta,
  Entry,
  SocketDef,
  SocketDefs,
  SocketMetaDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { addValueSchema } from '../../workspace/dataset';
import { getEntryCollection } from '../../workspace/entry';

export const copySchemas = (
  schemas: Array<ValueSchema>,
  newDsId: string,
  db: Db
) => Promise.all(schemas.map(s => addValueSchema(db, newDsId, s)));

export const getDynamicEntryContextInputs = async (
  inputDefs: SocketDefs<any>,
  inputs: { dataset: SocketMetaDef<DatasetMeta> },
  db: Db
): Promise<{ [name: string]: SocketDef }> => {
  if (!inputs.dataset || !inputs.dataset.isPresent) {
    return {};
  }

  const dynInputDefs = {};
  inputs.dataset.content!.schema.forEach(s => {
    dynInputDefs[s.name] = {
      dataType: s.type,
      displayName: s.name,
      isDynamic: true
    };
  });

  return dynInputDefs;
};

export const processEntries = async (
  db: Db,
  dsId: string,
  processFn: (entry: Entry) => Promise<void>
) => {
  const coll = getEntryCollection(db, dsId);
  const cursor = coll
    .find()
    .maxAwaitTimeMS(200)
    .maxTimeMS(200);
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    await processFn(doc);
  }
  await cursor.close();
};
